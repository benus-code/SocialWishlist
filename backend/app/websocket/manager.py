import socketio
from app.config import settings
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=origins)


@sio.event
async def connect(sid, environ):
    pass


@sio.event
async def join_wishlist(sid, data):
    wishlist_id = data.get("wishlist_id")
    if wishlist_id:
        await sio.enter_room(sid, f"wishlist_{wishlist_id}")


@sio.event
async def leave_wishlist(sid, data):
    wishlist_id = data.get("wishlist_id")
    if wishlist_id:
        await sio.leave_room(sid, f"wishlist_{wishlist_id}")


@sio.event
async def disconnect(sid):
    pass


async def broadcast_item_update(wishlist_id: str, item_id: str, total: int, contributors: int, status: str):
    await sio.emit(
        "item_updated",
        {
            "type": "ITEM_UPDATED",
            "itemId": item_id,
            "total": total,
            "contributors": contributors,
            "status": status,
        },
        room=f"wishlist_{wishlist_id}",
    )
