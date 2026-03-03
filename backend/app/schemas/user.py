from pydantic import BaseModel, EmailStr, Field
import uuid
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    display_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str


class UserUpdate(BaseModel):
    display_name: str | None = Field(None, min_length=1, max_length=100)


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str | None
    avatar_url: str | None = None
    oauth_provider: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=6)
