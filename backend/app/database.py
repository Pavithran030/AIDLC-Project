import ssl
import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

logger = logging.getLogger("syncwork")

# Clean the URL — strip any ?ssl=require or ?sslmode=require query params
_raw_url = settings.DATABASE_URL.strip()
_db_url = _raw_url.split("?")[0]

# Ensure the URL uses the asyncpg driver
if _db_url.startswith("postgresql://") and "+asyncpg" not in _db_url:
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)

logger.info(f"DB target: {_db_url.split('@')[-1] if '@' in _db_url else 'unknown'}")

# SSL context — required for Supabase
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

# Detect if using Supabase connection pooler (port 6543)
# Pooler (transaction mode) does NOT support prepared statements
_using_pooler = ":6543" in _db_url
if _using_pooler:
    logger.info("DB mode: Supabase connection pooler (transaction mode)")
else:
    logger.info("DB mode: Direct connection")

engine = create_async_engine(
    _db_url,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=180,
    pool_size=3,
    max_overflow=5,
    pool_timeout=30,
    connect_args={
        "ssl": _ssl_ctx,
        "timeout": 30,
        "command_timeout": 30,
        # Disable prepared statements when using Supabase pooler (transaction mode)
        # Pooler does not support them and will throw errors otherwise
        "statement_cache_size": 0 if _using_pooler else 100,
        "prepared_statement_cache_size": 0 if _using_pooler else 100,
    },
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
            logger.error(f"DB session error: {e}")
            raise


async def check_db_connection() -> dict:
    """Test the database connection. Used by /health endpoint."""
    from sqlalchemy import text
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"database": "ok"}
    except Exception as e:
        logger.error(f"DB health check failed: {e}")
        return {"database": "error", "detail": str(e)}
