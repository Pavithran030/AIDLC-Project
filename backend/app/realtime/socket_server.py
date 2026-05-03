import socketio
from app.config import settings

# Allow localhost for dev + the configured FRONTEND_URL for production
_allowed_origins = ["http://localhost:5173", "http://localhost:3000"]
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
