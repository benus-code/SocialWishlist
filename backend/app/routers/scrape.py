from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
import httpx
from bs4 import BeautifulSoup
import re
import json

router = APIRouter(prefix="/api/scrape", tags=["scrape"])


class ScrapeRequest(BaseModel):
    url: str


class ScrapeResponse(BaseModel):
    title: str | None = None
    image: str | None = None
    price: int | None = None
    currency: str | None = None


def extract_price(text: str) -> tuple[int | None, str | None]:
    """Extract price in cents and currency from text."""
    if not text:
        return None, None
    text = text.strip()
    # Remove non-breaking spaces, zero-width chars, etc.
    text = text.replace("\xa0", " ").replace("\u200b", "").replace("\u200e", "")

    # Common patterns: $29.99, 29,99 EUR, EUR 29.99, 29.99€
    currency_symbols = {"$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY", "₹": "INR"}
    currency = None

    for symbol, curr in currency_symbols.items():
        if symbol in text:
            currency = curr
            text = text.replace(symbol, "")
            break

    # Try to find currency code
    if not currency:
        for code in ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "INR", "SEK", "NOK", "DKK", "PLN", "CZK"]:
            if code in text.upper():
                currency = code
                text = re.sub(code, "", text, flags=re.IGNORECASE)
                break

    # Extract numeric value
    # Handle formats: 1,234.56 / 1.234,56 / 1 234,56 / 29.99 / 29,99
    match = re.search(r"(\d[\d\s.,]*\d|\d+)", text.strip())
    if match:
        price_str = match.group(1).replace(" ", "").replace("\u00a0", "")
        # Determine decimal separator
        if "," in price_str and "." in price_str:
            if price_str.rindex(",") > price_str.rindex("."):
                # Format: 1.234,56 (European)
                price_str = price_str.replace(".", "").replace(",", ".")
            else:
                # Format: 1,234.56 (US)
                price_str = price_str.replace(",", "")
        elif "," in price_str:
            parts = price_str.split(",")
            if len(parts[-1]) <= 2:
                # Likely decimal: 29,99 or 1234,5
                price_str = price_str.replace(",", ".")
            else:
                # Likely thousands: 1,234
                price_str = price_str.replace(",", "")
        try:
            val = float(price_str)
            if val > 0:
                return int(val * 100), currency or "EUR"
        except ValueError:
            pass

    return None, currency


def make_absolute_url(url: str, base_url: str) -> str:
    """Convert relative URL to absolute."""
    if not url:
        return ""
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        from urllib.parse import urlparse
        parsed = urlparse(base_url)
        return f"{parsed.scheme}://{parsed.netloc}{url}"
    if not url.startswith("http"):
        return base_url.rstrip("/") + "/" + url
    return url


@router.post("/", response_model=ScrapeResponse)
async def scrape_url(data: ScrapeRequest):
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=10.0,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
            },
        ) as client:
            response = await client.get(data.url)
            response.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(status_code=400, detail="Could not fetch URL")

    soup = BeautifulSoup(response.text, "html.parser")
    base_url = data.url

    # Extract title: og:title > title tag > h1
    title = None
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"]
    elif soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.h1:
        title = soup.h1.get_text(strip=True)

    # Extract image: og:image > Amazon-specific > product image > first large image
    image = None
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        image = make_absolute_url(og_image["content"], base_url)

    # For Amazon and similar sites, og:image may be missing or low-quality
    # Try Amazon-specific selectors
    if not image or "amazon" in base_url.lower():
        amazon_image = None
        # Amazon uses data-old-hires for high-res product images
        for img_id in ["landingImage", "imgBlkFront", "main-image"]:
            img = soup.find("img", id=img_id)
            if img:
                amazon_image = (
                    img.get("data-old-hires")
                    or img.get("src")
                    or img.get("data-src")
                )
                if amazon_image:
                    break
        # Amazon data-a-dynamic-image contains JSON with image URLs
        if not amazon_image:
            img = soup.find("img", attrs={"data-a-dynamic-image": True})
            if img:
                try:
                    dyn = json.loads(img["data-a-dynamic-image"])
                    # Pick the largest image (keys are URLs, values are [w, h])
                    if dyn:
                        amazon_image = max(dyn, key=lambda u: dyn[u][0] * dyn[u][1])
                except (json.JSONDecodeError, TypeError, ValueError):
                    amazon_image = img.get("src")
        # Also check class="a-dynamic-image"
        if not amazon_image:
            img = soup.find("img", class_=re.compile(r"a-dynamic-image", re.I))
            if img:
                amazon_image = img.get("data-old-hires") or img.get("src")
        if amazon_image:
            image = make_absolute_url(amazon_image, base_url)

    # Try JSON-LD for image
    if not image:
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                ld_data = json.loads(script.string)
                if isinstance(ld_data, list):
                    ld_data = ld_data[0] if ld_data else {}
                ld_image = ld_data.get("image")
                if ld_image:
                    if isinstance(ld_image, list):
                        ld_image = ld_image[0]
                    if isinstance(ld_image, dict):
                        ld_image = ld_image.get("url") or ld_image.get("contentUrl")
                    if isinstance(ld_image, str) and ld_image:
                        image = make_absolute_url(ld_image, base_url)
                        break
            except (json.JSONDecodeError, TypeError):
                continue

    # Generic product image selectors as fallback
    if not image:
        for selector in [
            {"class": re.compile(r"product.*image|gallery.*image|main.*image", re.I)},
            {"id": re.compile(r"product.*image|main.*image", re.I)},
        ]:
            img = soup.find("img", selector)
            if img and (img.get("src") or img.get("data-src")):
                image = make_absolute_url(img.get("src") or img.get("data-src"), base_url)
                break

    # Extract price: various meta tags and common selectors
    price = None
    currency = None

    # Try structured data first (JSON-LD) — search nested @graph arrays too
    for script in soup.find_all("script", type="application/ld+json"):
        if price is not None:
            break
        try:
            ld_data = json.loads(script.string)
            # Flatten: could be a single object, a list, or contain @graph
            items = []
            if isinstance(ld_data, list):
                items = ld_data
            elif isinstance(ld_data, dict):
                if "@graph" in ld_data:
                    items = ld_data["@graph"] if isinstance(ld_data["@graph"], list) else [ld_data["@graph"]]
                else:
                    items = [ld_data]
            for item in items:
                if not isinstance(item, dict):
                    continue
                offers = item.get("offers", item.get("Offers"))
                if offers is None:
                    # The item itself might be an Offer
                    if item.get("@type") in ("Offer", "AggregateOffer"):
                        offers = item
                    else:
                        continue
                if isinstance(offers, list):
                    offers = offers[0] if offers else {}
                if isinstance(offers, dict):
                    p = offers.get("price") or offers.get("lowPrice")
                    if p:
                        price = int(float(str(p).replace(",", ".").replace(" ", "")) * 100)
                        currency = offers.get("priceCurrency", "EUR")
                        break
        except (json.JSONDecodeError, ValueError, TypeError):
            continue

    # Try meta tags (og, product, twitter)
    if price is None:
        for meta_query in [
            {"property": "product:price:amount"},
            {"attrs": {"name": "price"}},
            {"attrs": {"name": "twitter:data1"}},
            {"property": "og:price:amount"},
        ]:
            price_meta = soup.find("meta", **meta_query)
            if price_meta and price_meta.get("content"):
                extracted_price, extracted_curr = extract_price(price_meta["content"])
                if extracted_price:
                    price = extracted_price
                    currency_meta = soup.find("meta", property="product:price:currency") or soup.find("meta", property="og:price:currency")
                    if currency_meta and currency_meta.get("content"):
                        currency = currency_meta["content"]
                    elif extracted_curr:
                        currency = extracted_curr
                    break

    # Amazon-specific price extraction
    if price is None and "amazon" in base_url.lower():
        for sel in [
            soup.find("span", class_="a-price-whole"),
            soup.find("span", id="priceblock_ourprice"),
            soup.find("span", id="priceblock_dealprice"),
            soup.find("span", id="price_inside_buybox"),
            soup.find("span", class_="priceToPay"),
        ]:
            if sel:
                price_text = sel.get_text(strip=True)
                # a-price-whole might be just "29" — look for sibling fraction
                if sel.get("class") and "a-price-whole" in sel.get("class", []):
                    fraction = sel.find_next_sibling("span", class_="a-price-fraction")
                    if fraction:
                        price_text = price_text.rstrip(",.") + "." + fraction.get_text(strip=True)
                price, currency = extract_price(price_text)
                if price:
                    break

    # Try common CSS selectors for price (expanded)
    if price is None:
        for selector in [
            {"itemprop": "price"},
            {"data-price": True},
            {"class": re.compile(r"product[_-]?price|current[_-]?price|sale[_-]?price|final[_-]?price", re.I)},
            {"class": re.compile(r"price(?!.*(?:old|was|crossed|compare|original|from))", re.I)},
            {"id": re.compile(r"price|ourprice", re.I)},
        ]:
            el = soup.find(attrs=selector)
            if el:
                price_text = el.get("content") or el.get("data-price") or el.get_text()
                if price_text:
                    price, curr = extract_price(str(price_text))
                    if price:
                        if not currency:
                            currency = curr
                        break

    return ScrapeResponse(
        title=title[:300] if title else None,
        image=image,
        price=price,
        currency=currency,
    )
