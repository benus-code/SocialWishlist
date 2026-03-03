from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from app.database import get_db
from app.models.user import User
from app.models.wishlist import Wishlist
from app.models.item import Item
from app.models.contribution import Contribution
from app.schemas.contribution import ContributionCreate, ContributionUpdate, ContributionResponse
from app.services.auth import get_current_user
from app.routers.wishlists import compute_item_status
from app.websocket.manager import broadcast_item_update

router = APIRouter(prefix="/api/items/{item_id}/contributions", tags=["contributions"])


async def get_item_funding_info(db: AsyncSession, item_id):
    result = await db.execute(
        select(
            func.coalesce(func.sum(Contribution.amount), 0).label("total"),
            func.count(Contribution.id).label("count"),
        ).where(Contribution.item_id == item_id, Contribution.amount > 0)
    )
    row = result.one()
    return int(row.total), int(row.count)


@router.post("/", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
async def create_contribution(
    item_id: str,
    data: ContributionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Lock the item row to prevent race conditions
    result = await db.execute(
        select(Item).where(Item.id == item_id).with_for_update()
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check wishlist is not archived
    wl = await db.execute(select(Wishlist).where(Wishlist.id == item.wishlist_id))
    if wl.scalar_one().is_archived:
        raise HTTPException(status_code=409, detail="This wishlist is archived. Contributions are no longer accepted.")

    # Check existing contribution by this user
    existing = await db.execute(
        select(Contribution).where(Contribution.item_id == item_id, Contribution.user_id == user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have a contribution for this item. Use PUT to update.")

    # Check remaining amount
    total_funded, _ = await get_item_funding_info(db, item_id)
    remaining = item.price - total_funded

    if remaining <= 0:
        raise HTTPException(status_code=409, detail="Item is already fully funded")

    if data.amount > remaining:
        raise HTTPException(status_code=409, detail=f"Amount exceeds remaining ({remaining} cents)")

    contribution = Contribution(
        item_id=item.id,
        user_id=user.id,
        amount=data.amount,
    )
    db.add(contribution)
    await db.commit()
    await db.refresh(contribution)

    # Broadcast update
    new_total, new_count = await get_item_funding_info(db, item_id)
    item_status = compute_item_status(new_total, item.price)
    await broadcast_item_update(str(item.wishlist_id), str(item.id), new_total, new_count, item_status)

    return ContributionResponse.model_validate(contribution)


@router.post("/reserve", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
async def reserve_item(
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Lock the item row
    result = await db.execute(
        select(Item).where(Item.id == item_id).with_for_update()
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check wishlist is not archived
    wl = await db.execute(select(Wishlist).where(Wishlist.id == item.wishlist_id))
    if wl.scalar_one().is_archived:
        raise HTTPException(status_code=409, detail="This wishlist is archived. Contributions are no longer accepted.")

    # Check no contributions exist
    total_funded, count = await get_item_funding_info(db, item_id)
    if total_funded > 0:
        raise HTTPException(status_code=409, detail="Cannot reserve: item already has contributions")

    # Check existing contribution by this user
    existing = await db.execute(
        select(Contribution).where(Contribution.item_id == item_id, Contribution.user_id == user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have a contribution for this item")

    # Reserve = contribute full price
    contribution = Contribution(
        item_id=item.id,
        user_id=user.id,
        amount=item.price,
    )
    db.add(contribution)
    await db.commit()
    await db.refresh(contribution)

    # Broadcast
    await broadcast_item_update(str(item.wishlist_id), str(item.id), item.price, 1, "FULLY_FUNDED")

    return ContributionResponse.model_validate(contribution)


@router.put("/", response_model=ContributionResponse)
async def update_contribution(
    item_id: str,
    data: ContributionUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Lock item
    result = await db.execute(
        select(Item).where(Item.id == item_id).with_for_update()
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check wishlist is not archived
    wl = await db.execute(select(Wishlist).where(Wishlist.id == item.wishlist_id))
    if wl.scalar_one().is_archived:
        raise HTTPException(status_code=409, detail="This wishlist is archived. Contributions are no longer accepted.")

    # Find existing contribution
    result = await db.execute(
        select(Contribution).where(Contribution.item_id == item_id, Contribution.user_id == user.id)
    )
    contribution = result.scalar_one_or_none()
    if not contribution:
        raise HTTPException(status_code=404, detail="No contribution found to update")

    # Get current total excluding this user's contribution
    total_funded, _ = await get_item_funding_info(db, item_id)
    others_total = total_funded - contribution.amount

    # If withdrawing (setting to 0), check item isn't fully funded
    if data.amount == 0:
        if total_funded >= item.price:
            raise HTTPException(status_code=409, detail="Cannot withdraw: item is fully funded")
        contribution.amount = 0
    else:
        remaining = item.price - others_total
        if data.amount > remaining:
            raise HTTPException(status_code=409, detail=f"Amount exceeds remaining ({remaining} cents)")
        contribution.amount = data.amount

    await db.commit()
    await db.refresh(contribution)

    # Broadcast
    new_total, new_count = await get_item_funding_info(db, item_id)
    item_status = compute_item_status(new_total, item.price)
    await broadcast_item_update(str(item.wishlist_id), str(item.id), new_total, new_count, item_status)

    return ContributionResponse.model_validate(contribution)


@router.get("/mine", response_model=ContributionResponse | None)
async def get_my_contribution(
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Contribution).where(Contribution.item_id == item_id, Contribution.user_id == user.id)
    )
    contribution = result.scalar_one_or_none()
    if not contribution:
        return None
    return ContributionResponse.model_validate(contribution)
