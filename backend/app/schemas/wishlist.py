from pydantic import BaseModel, Field
import uuid
from datetime import datetime, date


class WishlistCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    occasion: str | None = None
    event_date: date | None = None
    currency: str = "EUR"


class WishlistUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    occasion: str | None = None
    event_date: date | None = None
    is_archived: bool | None = None


class WishlistResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None = None
    occasion: str | None
    event_date: date | None
    slug: str
    currency: str
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
