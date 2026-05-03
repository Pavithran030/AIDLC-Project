import socketio
from app.config import settings

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[settings.FRONTEND_URL],
    logger=False,
    engineio_logger=False,
)

# socketio_path="" because FastAPI mounts this app at /socket.io already.
# Setting it here too would cause double-path: /socket.io/socket.io
socket_app = socketio.ASGIApp(sio, socketio_path="")
