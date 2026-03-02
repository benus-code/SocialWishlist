from pydantic import BaseModel, Field
import uuid
from datetime import datetime


class ContributionCreate(BaseModel):
    amount: int = Field(ge=100)


class ContributionUpdate(BaseModel):
    amount: int = Field(ge=0)


class ContributionResponse(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID
    amount: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
