#!/bin/sh
set -e

# If alembic_version table doesn't exist, stamp the DB at head (002)
# All tables were already created by create_all, so skip all migrations
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
            print('First alembic run: stamping database at head (002)...')
            await conn.execute(text('CREATE TABLE alembic_version (version_num VARCHAR(32) NOT NULL)'))
            await conn.execute(text(\"INSERT INTO alembic_version VALUES ('002')\"))
        else:
            # Fix: if previously stamped at 001 but 002 tables already exist, update to 002
            result2 = await conn.execute(text(\"SELECT version_num FROM alembic_version\"))
            current = result2.scalar()
            if current == '001':
                # Check if password_reset_tokens already exists
                result3 = await conn.execute(text(
                    \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'password_reset_tokens')\"
                ))
                prt_exists = result3.scalar()
                if prt_exists:
                    print('Updating stamp from 001 to 002 (table already exists)...')
                    await conn.execute(text(\"UPDATE alembic_version SET version_num = '002'\"))
                else:
                    print('At revision 001, will migrate to head.')
            else:
                print(f'Already at revision {current}, skipping stamp.')
    await engine.dispose()

asyncio.run(stamp_if_needed())
"

# Run any pending migrations (future migrations only)
alembic upgrade head

# Start the server
exec uvicorn app.main:socket_app --host 0.0.0.0 --port 8000
