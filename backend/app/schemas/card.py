from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.schemas.user import UserOut


class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_user_id: Optional[str] = None
    deadline: Optional[datetime] = None


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_user_id: Optional[str] = None
    deadline: Optional[datetime] = None


class CardMove(BaseModel):
    column_id: str


class CardOut(BaseModel):
    id: str
    column_id: str
    title: str
    description: Optional[str]
    assigned_user_id: Optional[str]
    assigned_user: Optional[UserOut]
    deadline: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
