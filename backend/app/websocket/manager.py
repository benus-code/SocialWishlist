import logging

import socketio
from app.config import settings

logger = logging.getLogger(__name__)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins)


@sio.event
async def connect(sid, environ):
    logger.info("WS client connected: %s", sid)


@sio.event
async def join_wishlist(sid, data):
    wishlist_id = data.get("wishlist_id")
    if wishlist_id:
        sio.enter_room(sid, f"wishlist_{wishlist_id}")
        logger.info("WS %s joined room wishlist_%s", sid, wishlist_id)


@sio.event
async def leave_wishlist(sid, data):
    wishlist_id = data.get("wishlist_id")
    if wishlist_id:
        sio.leave_room(sid, f"wishlist_{wishlist_id}")


@sio.event
async def disconnect(sid):
    logger.info("WS client disconnected: %s", sid)


async def broadcast_item_update(wishlist_id: str, item_id: str, total: int, contributors: int, status: str):
    room = f"wishlist_{wishlist_id}"
    logger.info("Broadcasting item_updated to room %s (item=%s, total=%s)", room, item_id, total)
    await sio.emit(
        "item_updated",
        {
            "type": "ITEM_UPDATED",
            "itemId": item_id,
            "total": total,
            "contributors": contributors,
            "status": status,
        },
        room=room,
    )
