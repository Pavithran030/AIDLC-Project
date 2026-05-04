import logging
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings

# Must import all models so Base.metadata is populated
import app.models  # noqa: F401

from app.routers import auth, boards, cards
from app.realtime.socket_server import sio, socket_app
from app.realtime import handlers  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("syncwork")

scheduler = AsyncIOScheduler()


async def keep_alive():
    """
    Ping our own /health endpoint every 10 minutes.
    Prevents Render free tier from spinning down the service.
    Only runs when RENDER_EXTERNAL_URL is set (i.e. on Render, not locally).
    """
    render_url = settings.RENDER_EXTERNAL_URL
    if not render_url:
        return
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{render_url}/health")
            logger.info(f"Keep-alive ping: {resp.status_code}")
    except Exception as e:
        logger.warning(f"Keep-alive ping failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== Syncwork API starting ===")
    logger.info(f"FRONTEND_URL : {settings.FRONTEND_URL}")

    from app.database import check_db_connection
    db_status = await check_db_connection()
    logger.info(f"DB status    : {db_status}")

    try:
        from app.scheduler.jobs import check_deadlines
        scheduler.add_job(
            check_deadlines, "interval", minutes=15,
            id="deadline_checker", replace_existing=True
        )
        # Self-ping every 10 minutes to prevent Render cold starts
        scheduler.add_job(
            keep_alive, "interval", minutes=10,
            id="keep_alive", replace_existing=True
        )
        scheduler.start()
        logger.info("Scheduler    : started (deadline checker + keep-alive)")
    except Exception as e:
        logger.error(f"Scheduler failed: {e}")

    yield

    scheduler.shutdown(wait=False)
    logger.info("=== Syncwork API stopped ===")


app = FastAPI(title="Syncwork API", lifespan=lifespan)

# ── CORS ──────────────────────────────────────────────────────────────────────
_allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://syncwork-mu.vercel.app",
]
if settings.FRONTEND_URL not in _allowed_origins:
    _allowed_origins.append(settings.FRONTEND_URL)

logger.info(f"CORS origins : {_allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    logger.error(
        f"500 on {request.method} {request.url.path}: {type(exc).__name__}: {exc}",
        exc_info=True,
    )
    headers = {}
    if origin in _allowed_origins:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {str(exc)}"},
        headers=headers,
    )


app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(cards.router)


@app.get("/health")
async def health():
    from app.database import check_db_connection
    db = await check_db_connection()
    status = "ok" if db["database"] == "ok" else "degraded"
    return {"status": status, "database": db}


@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "600",
        },
    )


app.mount("/socket.io", socket_app)
