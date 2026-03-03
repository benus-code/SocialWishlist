from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/postgres"

    @model_validator(mode="after")
    def fix_database_url(self) -> "Settings":
        # Render provides postgres:// URLs, convert for asyncpg
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            self.DATABASE_URL = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            self.DATABASE_URL = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    CORS_ORIGINS: str = "http://localhost:3000"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Minimum contribution in cents (default 100 = 1 EUR)
    MIN_CONTRIBUTION_CENTS: int = 100

    # Resend (email)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "noreply@wishly.app"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {"env_file": ".env"}


settings = Settings()
