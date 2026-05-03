from app.realtime.socket_server import sio
from app.realtime import presence as presence_store


@sio.event
async def connect(sid, environ, auth):
    pass  # Auth validated per event via token in auth dict


@sio.event
async def disconnect(sid):
    board_id = presence_store.get_board_for_sid(sid)
    if board_id:
        presence_store.remove_user(sid)
        users = presence_store.get_users(board_id)
        await sio.emit("presence_update", {"users": users}, room=board_id)


@sio.event
async def join_board(sid, data):
    """
    data: {board_id: str, user_id: str, display_name: str}
    """
    board_id = data.get("board_id")
    user_id = data.get("user_id")
    display_name = data.get("display_name", "Unknown")

    if not board_id or not user_id:
        return

    await sio.enter_room(sid, board_id)
    presence_store.add_user(board_id, user_id, display_name, sid)
    users = presence_store.get_users(board_id)
    await sio.emit("presence_update", {"users": users}, room=board_id)


@sio.event
async def leave_board(sid, data):
    board_id = data.get("board_id")
    if board_id:
        await sio.leave_room(sid, board_id)
        presence_store.remove_user(sid)
        users = presence_store.get_users(board_id)
        await sio.emit("presence_update", {"users": users}, room=board_id)
