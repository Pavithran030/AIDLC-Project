import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Syncwork API starting up...")
    logger.info(f"FRONTEND_URL: {settings.FRONTEND_URL}")

    try:
        from app.scheduler.jobs import check_deadlines
        scheduler.add_job(
            check_deadlines, "interval", minutes=15,
            id="deadline_checker", replace_existing=True
        )
        scheduler.start()
        logger.info("Scheduler started.")
    except Exception as e:
        logger.error(f"Scheduler failed to start: {e}")

    yield

    scheduler.shutdown(wait=False)


app = FastAPI(title="Syncwork API", lifespan=lifespan)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Collect all allowed origins: localhost for dev + the deployed Vercel URL
_allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://syncwork-mu.vercel.app",  # production frontend
]
# Also add whatever FRONTEND_URL is set to on Render (handles custom domains)
if settings.FRONTEND_URL not in _allowed_origins:
    _allowed_origins.append(settings.FRONTEND_URL)

logger.info(f"CORS allowed origins: {_allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(cards.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


# Explicit OPTIONS handler — catches preflight requests before Socket.io mount
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    """Return 200 for all CORS preflight OPTIONS requests."""
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


# Mount Socket.io — must come AFTER all routes so OPTIONS handler takes priority
app.mount("/socket.io", socket_app)
