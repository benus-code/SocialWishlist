from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.wishlist import Wishlist
from app.models.item import Item
from app.models.contribution import Contribution
from app.schemas.wishlist import WishlistCreate, WishlistUpdate, WishlistResponse
from app.schemas.item import ItemResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/wishlists", tags=["wishlists"])


def compute_item_status(total_funded: int, price: int) -> str:
    if total_funded <= 0:
        return "AVAILABLE"
    if total_funded >= price:
        return "FULLY_FUNDED"
    return "PARTIALLY_FUNDED"


async def get_items_with_funding(db: AsyncSession, wishlist_id):
    result = await db.execute(
        select(Item).where(Item.wishlist_id == wishlist_id).order_by(Item.created_at)
    )
    items = result.scalars().all()

    item_responses = []
    for item in items:
        contrib_result = await db.execute(
            select(
                func.coalesce(func.sum(Contribution.amount), 0).label("total"),
                func.count(Contribution.id).label("count"),
            ).where(Contribution.item_id == item.id, Contribution.amount > 0)
        )
        row = contrib_result.one()
        total_funded = int(row.total)
        contributor_count = int(row.count)
        status = compute_item_status(total_funded, item.price)

        item_responses.append(
            ItemResponse(
                id=item.id,
                wishlist_id=item.wishlist_id,
                name=item.name,
                link=item.link,
                price=item.price,
                image_url=item.image_url,
                total_funded=total_funded,
                contributor_count=contributor_count,
                status=status,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
        )
    return item_responses


@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
async def create_wishlist(
    data: WishlistCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    wishlist = Wishlist(
        user_id=user.id,
        title=data.title,
        description=data.description,
        occasion=data.occasion,
        event_date=data.event_date,
        currency=data.currency,
    )
    db.add(wishlist)
    await db.commit()
    await db.refresh(wishlist)
    return WishlistResponse.model_validate(wishlist)


@router.get("/", response_model=list[WishlistResponse])
async def list_wishlists(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == user.id).order_by(Wishlist.created_at.desc())
    )
    return [WishlistResponse.model_validate(w) for w in result.scalars().all()]


@router.get("/{wishlist_id}", response_model=WishlistResponse)
async def get_wishlist(
    wishlist_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user.id))
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    return WishlistResponse.model_validate(wishlist)


@router.put("/{wishlist_id}", response_model=WishlistResponse)
async def update_wishlist(
    wishlist_id: str,
    data: WishlistUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user.id))
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(wishlist, key, value)

    await db.commit()
    await db.refresh(wishlist)
    return WishlistResponse.model_validate(wishlist)


@router.delete("/{wishlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wishlist(
    wishlist_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user.id))
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    await db.delete(wishlist)
    await db.commit()


@router.get("/public/{slug}")
async def get_public_wishlist(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wishlist).where(Wishlist.slug == slug))
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise HTTPException(status_code=404, detail="This wishlist no longer exists.")

    items = await get_items_with_funding(db, wishlist.id)

    return {
        "id": str(wishlist.id),
        "title": wishlist.title,
        "description": wishlist.description,
        "occasion": wishlist.occasion,
        "event_date": str(wishlist.event_date) if wishlist.event_date else None,
        "slug": wishlist.slug,
        "currency": wishlist.currency,
        "is_archived": wishlist.is_archived,
        "items": [item.model_dump() for item in items],
    }
