from datetime import datetime
from pydantic import BaseModel


class ColumnOut(BaseModel):
    id: str
    board_id: str
    name: str
    position: int
    created_at: datetime

    model_config = {"from_attributes": True}
