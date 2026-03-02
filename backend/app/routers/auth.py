from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, GoogleAuthRequest, TokenResponse, UserResponse
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=86400,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    _set_session_cookie(response, token)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user.id)
    _set_session_cookie(response, token)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/google", response_model=TokenResponse)
async def google_auth(data: GoogleAuthRequest, response: Response, db: AsyncSession = Depends(get_db)):
    # Verify the Google ID token
    try:
        async with httpx.AsyncClient() as client:
            google_response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={data.credential}"
            )
            if google_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            google_user = google_response.json()
    except httpx.HTTPError:
        raise HTTPException(status_code=401, detail="Could not verify Google token")

    email = google_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="No email in Google token")

    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        # Update OAuth info if not set
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_id = google_user.get("sub")
        if not user.avatar_url and google_user.get("picture"):
            user.avatar_url = google_user["picture"]
        if not user.display_name and google_user.get("name"):
            user.display_name = google_user["name"]
        await db.commit()
        await db.refresh(user)
    else:
        # Create new user
        user = User(
            email=email,
            display_name=google_user.get("name"),
            avatar_url=google_user.get("picture"),
            oauth_provider="google",
            oauth_id=google_user.get("sub"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(user.id)
    _set_session_cookie(response, token)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/google/client-id")
async def google_client_id():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=404, detail="Google OAuth not configured")
    return {"client_id": settings.GOOGLE_CLIENT_ID}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("session_token")
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
