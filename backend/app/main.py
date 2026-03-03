import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from alembic.config import Config
from alembic import command

from app.config import settings
from app.database import engine, Base
from app.models import user, wishlist, item, contribution  # noqa: F401 - register models
from app.routers import auth, wishlists, items, contributions, scrape
from app.websocket.manager import sio

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run Alembic migrations on startup, fallback to create_all
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("Alembic migrations applied successfully")
    except Exception as e:
        logger.warning("Alembic migration failed (%s), falling back to create_all", e)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Social Wishlist API", version="1.0.0", lifespan=lifespan)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(wishlists.router)
app.include_router(items.router)
app.include_router(contributions.router)
app.include_router(scrape.router)

# Socket.IO
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
