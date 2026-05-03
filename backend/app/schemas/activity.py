from datetime import datetime
from pydantic import BaseModel


class ActivityOut(BaseModel):
    id: str
    board_id: str
    user_id: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}
