import socketio
from app.config import settings

_allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://syncwork-mu.vercel.app",  # production frontend
]
if settings.FRONTEND_URL not in _allowed_origins:
    _allowed_origins.append(settings.FRONTEND_URL)

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=_allowed_origins,
    logger=False,
    engineio_logger=False,
)

# socketio_path="" because FastAPI mounts this at /socket.io already
socket_app = socketio.ASGIApp(sio, socketio_path="")
