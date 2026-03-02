from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User
from app.models.wishlist import Wishlist
from app.models.item import Item
from app.models.contribution import Contribution
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse
from app.services.auth import get_current_user
from app.routers.wishlists import compute_item_status

router = APIRouter(prefix="/api/wishlists/{wishlist_id}/items", tags=["items"])


async def get_item_funding(db: AsyncSession, item_id):
    result = await db.execute(
        select(
            func.coalesce(func.sum(Contribution.amount), 0).label("total"),
            func.count(Contribution.id).label("count"),
        ).where(Contribution.item_id == item_id, Contribution.amount > 0)
    )
    row = result.one()
    return int(row.total), int(row.count)


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    wishlist_id: str,
    data: ItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user.id)
    )
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")

    item = Item(
        wishlist_id=wishlist.id,
        name=data.name,
        link=data.link,
        price=data.price,
        image_url=data.image_url,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return ItemResponse(
        id=item.id,
        wishlist_id=item.wishlist_id,
        name=item.name,
        link=item.link,
        price=item.price,
        image_url=item.image_url,
        total_funded=0,
        contributor_count=0,
        status="AVAILABLE",
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.get("/", response_model=list[ItemResponse])
async def list_items(
    wishlist_id: str,
    db: AsyncSession = Depends(get_db),
):
    from app.routers.wishlists import get_items_with_funding
    return await get_items_with_funding(db, wishlist_id)


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    wishlist_id: str,
    item_id: str,
    data: ItemUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Wishlist not found")

    result = await db.execute(select(Item).where(Item.id == item_id, Item.wishlist_id == wishlist_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    total_funded, contributor_count = await get_item_funding(db, item.id)
    if total_funded > 0:
        raise HTTPException(status_code=400, detail="Cannot edit item with existing contributions")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)

    return ItemResponse(
        id=item.id,
        wishlist_id=item.wishlist_id,
        name=item.name,
        link=item.link,
        price=item.price,
        image_url=item.image_url,
        total_funded=total_funded,
        contributor_count=contributor_count,
        status=compute_item_status(total_funded, item.price),
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.get("/{item_id}/deletion-info")
async def get_item_deletion_info(
    wishlist_id: str,
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get info about what will be affected by deleting this item."""
    result = await db.execute(
        select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Wishlist not found")

    result = await db.execute(select(Item).where(Item.id == item_id, Item.wishlist_id == wishlist_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    total_funded, contributor_count = await get_item_funding(db, item.id)
    return {
        "item_name": item.name,
        "total_funded": total_funded,
        "contributor_count": contributor_count,
        "has_contributions": total_funded > 0,
    }


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    wishlist_id: str,
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Wishlist not found")

    result = await db.execute(select(Item).where(Item.id == item_id, Item.wishlist_id == wishlist_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(item)
    await db.commit()
