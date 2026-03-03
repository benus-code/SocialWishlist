#!/bin/sh
set -e

# If alembic_version table doesn't exist, stamp the DB at revision 001
# (meaning: the initial schema already exists, skip recreating it)
python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def stamp_if_needed():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        result = await conn.execute(text(
            \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alembic_version')\"
        ))
        exists = result.scalar()
        if not exists:
            print('First alembic run: stamping database at revision 001...')
            await conn.execute(text('CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL)'))
            await conn.execute(text(\"INSERT INTO alembic_version VALUES ('001')\"))
        else:
            print('alembic_version table already exists, skipping stamp.')
    await engine.dispose()

asyncio.run(stamp_if_needed())
"

# Run any pending migrations (will apply 002+ only)
alembic upgrade head

# Start the server
exec uvicorn app.main:socket_app --host 0.0.0.0 --port 8000
