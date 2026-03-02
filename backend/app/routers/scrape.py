from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
import httpx
from bs4 import BeautifulSoup
import re

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
    # Common patterns: $29.99, 29,99 EUR, EUR 29.99, 29.99€
    currency_symbols = {"$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY"}
    currency = None

    for symbol, curr in currency_symbols.items():
        if symbol in text:
            currency = curr
            text = text.replace(symbol, "")
            break

    # Try to find currency code
    if not currency:
        for code in ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"]:
            if code in text.upper():
                currency = code
                text = re.sub(code, "", text, flags=re.IGNORECASE)
                break

    # Extract numeric value
    # Handle both 1,234.56 and 1.234,56 formats
    match = re.search(r"(\d[\d\s]*[.,]?\d*)", text.strip())
    if match:
        price_str = match.group(1).replace(" ", "")
        # Determine decimal separator
        if "," in price_str and "." in price_str:
            if price_str.index(",") > price_str.index("."):
                price_str = price_str.replace(".", "").replace(",", ".")
            else:
                price_str = price_str.replace(",", "")
        elif "," in price_str:
            parts = price_str.split(",")
            if len(parts[-1]) == 2:
                price_str = price_str.replace(",", ".")
            else:
                price_str = price_str.replace(",", "")
        try:
            return int(float(price_str) * 100), currency or "EUR"
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

    # Extract image: og:image > product image > first large image
    image = None
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        image = make_absolute_url(og_image["content"], base_url)
    else:
        # Look for product images
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

    # Try structured data first (JSON-LD)
    import json
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            ld_data = json.loads(script.string)
            if isinstance(ld_data, list):
                ld_data = ld_data[0] if ld_data else {}
            offers = ld_data.get("offers", ld_data.get("Offers", {}))
            if isinstance(offers, list):
                offers = offers[0] if offers else {}
            if isinstance(offers, dict):
                p = offers.get("price") or offers.get("lowPrice")
                if p:
                    price = int(float(str(p)) * 100)
                    currency = offers.get("priceCurrency", "EUR")
                    break
        except (json.JSONDecodeError, ValueError, TypeError):
            continue

    # Try meta tags
    if price is None:
        price_meta = soup.find("meta", property="product:price:amount") or soup.find("meta", attrs={"name": "price"})
        if price_meta and price_meta.get("content"):
            try:
                price = int(float(price_meta["content"]) * 100)
            except ValueError:
                pass
            currency_meta = soup.find("meta", property="product:price:currency")
            if currency_meta and currency_meta.get("content"):
                currency = currency_meta["content"]

    # Try common CSS selectors for price
    if price is None:
        for selector in [
            {"class": re.compile(r"price|Price|product-price", re.I)},
            {"itemprop": "price"},
            {"data-price": True},
        ]:
            el = soup.find(attrs=selector)
            if el:
                price_text = el.get("content") or el.get("data-price") or el.get_text()
                if price_text:
                    price, currency = extract_price(str(price_text))
                    if price:
                        break

    return ScrapeResponse(
        title=title[:300] if title else None,
        image=image,
        price=price,
        currency=currency,
    )
