from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BoardCreate(BaseModel):
    name: str


class BoardJoin(BaseModel):
    join_code: str


class BoardUpdate(BaseModel):
    deadline_alert_hours: Optional[int] = None


class BoardOut(BaseModel):
    id: str
    name: str
    join_code: str
    owner_id: str
    deadline_alert_hours: int
    created_at: datetime

    model_config = {"from_attributes": True}
