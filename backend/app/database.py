import ssl
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text, event

from app.config import settings

logger = logging.getLogger("syncwork")


def _build_db_url(raw: str) -> str:
    """
    Normalize the DATABASE_URL:
    - Strip query params (?ssl=require, ?sslmode=require) — asyncpg uses connect_args
    - Ensure the asyncpg driver prefix is present
    - Handle postgres:// shorthand (used by some providers)
    """
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
# Required for Supabase (both direct and pooler).
# CERT_NONE = encrypted connection, no certificate chain verification.
# This is necessary because some cloud hosts (including Render) don't have
# Supabase's CA in their trust store.
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

# ── Engine ────────────────────────────────────────────────────────────────────
# statement_cache_size=0 and prepared_statement_cache_size=0 are ALWAYS set.
#
# Why: Supabase connection pooler (PgBouncer in transaction mode) does not
# persist prepared statements across connections. asyncpg caches them by
# default, causing DuplicatePreparedStatementError on the pooler.
# Setting both to 0 disables the cache entirely — safe for both direct
# connections and pooler connections, with negligible performance impact.
engine = create_async_engine(
    _db_url,
    echo=False,
    pool_pre_ping=True,      # verify connection before use — catches stale connections
    pool_recycle=180,        # recycle connections every 3 min (Render free tier sleeps)
    pool_size=3,             # small pool — Supabase free tier has a 60-connection limit
    max_overflow=5,
    pool_timeout=30,
    connect_args={
        "ssl": _ssl_ctx,
        "timeout": 30,                       # connection timeout (seconds)
        "command_timeout": 60,               # query timeout (seconds)
        "statement_cache_size": 0,           # disable asyncpg prepared statement cache
        "prepared_statement_cache_size": 0,  # disable PgBouncer-incompatible cache
    },
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


# ── Session dependency ────────────────────────────────────────────────────────
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"DB session error: {type(e).__name__}: {e}")
            raise


# ── Health check ──────────────────────────────────────────────────────────────
async def check_db_connection() -> dict:
    """
    Test the database connection with a simple SELECT 1.
    Returns {"database": "ok"} or {"database": "error", "detail": "..."}.
    Used by the /health endpoint.
    """
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"database": "ok"}
    except Exception as e:
        logger.error(f"DB health check failed: {type(e).__name__}: {e}")
        return {"database": "error", "detail": f"{type(e).__name__}: {str(e)}"}


# ── Retry helper ──────────────────────────────────────────────────────────────
async def with_db_retry(coro_fn, retries: int = 3, delay: float = 1.0):
    """
    Execute an async coroutine with exponential backoff retry.
    Use for operations that may fail due to transient connection issues.

    Example:
        result = await with_db_retry(lambda: some_db_operation(db))
    """
    last_exc = None
    for attempt in range(retries):
        try:
            return await coro_fn()
        except Exception as e:
            last_exc = e
            wait = delay * (2 ** attempt)
            logger.warning(f"DB retry {attempt + 1}/{retries} after {wait}s: {e}")
            await asyncio.sleep(wait)
    raise last_exc
