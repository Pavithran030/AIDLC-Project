import ssl
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text, NullPool

from app.config import settings

logger = logging.getLogger("syncwork")


def _build_db_url(raw: str) -> str:
    """Normalize DATABASE_URL to postgresql+asyncpg:// format, strip query params."""
    url = raw.strip().split("?")[0]
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


_db_url = _build_db_url(settings.DATABASE_URL)
_db_host = _db_url.split("@")[-1] if "@" in _db_url else "unknown"
logger.info(f"DB target : {_db_host}")

# ── SSL ───────────────────────────────────────────────────────────────────────
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

# ── Engine ────────────────────────────────────────────────────────────────────
# CRITICAL for PgBouncer / Supabase pooler (transaction mode):
#
# The DuplicatePreparedStatementError happens because SQLAlchemy's asyncpg
# dialect runs its own internal queries (like "select current_schema()") using
# prepared statements BEFORE your connect_args are applied to the connection.
#
# The correct fix is to use NullPool + pass statement_cache_size=0 directly
# to the asyncpg dialect via connect_args. NullPool creates a fresh connection
# per request — no connection reuse across requests, which is exactly what
# PgBouncer transaction mode expects.
engine = create_async_engine(
    _db_url,
    # NullPool: no connection pooling on SQLAlchemy side.
    # PgBouncer IS the pool — SQLAlchemy should not pool on top of it.
    # This eliminates all prepared statement conflicts.
    poolclass=NullPool,
    echo=False,
    connect_args={
        "ssl": _ssl_ctx,
        "timeout": 30,
        "command_timeout": 60,
        "statement_cache_size": 0,           # disable asyncpg prepared stmt cache
        "prepared_statement_cache_size": 0,  # disable asyncpg prepared stmt cache
    },
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"DB session error: {type(e).__name__}: {e}")
            raise


async def check_db_connection() -> dict:
    """Test DB connection. Used by /health endpoint."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"database": "ok"}
    except Exception as e:
        logger.error(f"DB health check failed: {type(e).__name__}: {e}")
        return {"database": "error", "detail": f"{type(e).__name__}: {str(e)}"}


async def with_db_retry(coro_fn, retries: int = 3, delay: float = 1.0):
    """Retry an async DB operation with exponential backoff."""
    last_exc = None
    for attempt in range(retries):
        try:
            return await coro_fn()
        except Exception as e:
            last_exc = e
            wait = delay * (2 ** attempt)
            logger.warning(f"DB retry {attempt + 1}/{retries} in {wait}s: {e}")
            await asyncio.sleep(wait)
    raise last_exc
