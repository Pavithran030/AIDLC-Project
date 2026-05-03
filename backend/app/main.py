from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.database import engine, Base

# Must import all models so Base.metadata is populated
import app.models  # noqa: F401

from app.routers import auth, boards, cards
from app.realtime.socket_server import sio, socket_app
from app.realtime import handlers  # noqa: F401 — registers @sio.event handlers

scheduler = AsyncIOScheduler()


def run_migrations():
    """Run Alembic migrations synchronously at startup."""
    from alembic.config import Config
    from alembic import command
    from pathlib import Path

    alembic_cfg = Config(str(Path(__file__).parent.parent / "alembic.ini"))
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run DB migrations on every startup — safe and idempotent
    run_migrations()

    # Start deadline background job
    from app.scheduler.jobs import check_deadlines
    scheduler.add_job(
        check_deadlines, "interval", minutes=15,
        id="deadline_checker", replace_existing=True
    )
    scheduler.start()

    yield

    scheduler.shutdown(wait=False)


app = FastAPI(title="Syncwork API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
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


# Mount Socket.io at /socket.io
app.mount("/socket.io", socket_app)
