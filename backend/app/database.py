import ssl
import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

logger = logging.getLogger("syncwork")

# Clean the DATABASE_URL:
# - Strip ?ssl=require or any query params (asyncpg uses connect_args for SSL)
# - Render sometimes adds ?sslmode=require automatically
_db_url = settings.DATABASE_URL.split("?")[0]
logger.info(f"Database connecting to: {_db_url.split('@')[-1] if '@' in _db_url else 'configured'}")

# SSL context — required for Supabase
# CERT_NONE skips certificate chain verification (needed on some hosts)
# The connection is still fully encrypted
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    _db_url,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    connect_args={"ssl": _ssl_ctx},
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
