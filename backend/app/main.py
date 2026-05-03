from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.database import engine, Base

# Must import all models before create_all so metadata is populated
import app.models  # noqa: F401

from app.routers import auth, boards, cards
from app.realtime.socket_server import sio, socket_app
from app.realtime import handlers  # noqa: F401 — registers @sio.event handlers

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on startup (idempotent — skips existing tables)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Start deadline background job
    from app.scheduler.jobs import check_deadlines
    scheduler.add_job(check_deadlines, "interval", minutes=15, id="deadline_checker",
                      replace_existing=True)
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


# Mount Socket.io at /socket.io — socket_app has socketio_path="" so no double path
app.mount("/socket.io", socket_app)
