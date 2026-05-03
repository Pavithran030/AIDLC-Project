import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Strip ?ssl=require if present — asyncpg handles SSL via connect_args
_db_url = settings.DATABASE_URL.split("?")[0]

# Use SSL for all connections (required by Supabase and most cloud DBs).
# CERT_NONE keeps the connection encrypted but skips certificate chain
# verification — needed on some hosts where the CA bundle is incomplete.
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    _db_url,
    echo=False,
    pool_pre_ping=True,          # detect stale connections (important on Render free tier)
    pool_recycle=300,            # recycle connections every 5 min
    connect_args={"ssl": _ssl_ctx},
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
