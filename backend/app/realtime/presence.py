from typing import Dict, List

# In-memory presence store: {board_id: [{user_id, display_name, sid}]}
_presence: Dict[str, List[dict]] = {}


def add_user(board_id: str, user_id: str, display_name: str, sid: str):
    if board_id not in _presence:
        _presence[board_id] = []
    # Remove any stale entry for this user
    _presence[board_id] = [u for u in _presence[board_id] if u["user_id"] != user_id]
    _presence[board_id].append({"user_id": user_id, "display_name": display_name, "sid": sid})


def remove_user(sid: str):
    for board_id in list(_presence.keys()):
        _presence[board_id] = [u for u in _presence[board_id] if u["sid"] != sid]


def get_users(board_id: str) -> List[dict]:
    return [{"user_id": u["user_id"], "display_name": u["display_name"]} for u in _presence.get(board_id, [])]


def get_board_for_sid(sid: str) -> str | None:
    for board_id, users in _presence.items():
        for u in users:
            if u["sid"] == sid:
                return board_id
    return None
