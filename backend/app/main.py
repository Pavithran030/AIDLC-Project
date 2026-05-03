import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
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
    logger.info(f"DB host: {settings.DATABASE_URL.split('@')[-1].split('/')[0] if '@' in settings.DATABASE_URL else 'configured'}")

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
    logger.info("Syncwork API shut down.")


app = FastAPI(title="Syncwork API", lifespan=lifespan)

# CORS — allow localhost for dev + Vercel URL for production
_allowed_origins = ["http://localhost:5173", "http://localhost:3000"]
if settings.FRONTEND_URL not in _allowed_origins:
    _allowed_origins.append(settings.FRONTEND_URL)

logger.info(f"CORS allowed origins: {_allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(cards.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


app.mount("/socket.io", socket_app)
