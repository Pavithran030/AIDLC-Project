from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.board import BoardCreate, BoardJoin, BoardUpdate, BoardOut
from app.schemas.column import ColumnOut
from app.schemas.card import CardOut
from app.schemas.user import UserOut
from app.schemas.activity import ActivityOut
from app.services import board_service, activity_service
from app.security import get_current_user

router = APIRouter(prefix="/boards", tags=["boards"])


@router.post("", response_model=BoardOut)
async def create_board(
    data: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await board_service.create_board(data, current_user, db)


@router.get("", response_model=list[BoardOut])
async def list_boards(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await board_service.get_user_boards(current_user.id, db)


@router.post("/join", response_model=BoardOut)
async def join_board(
    data: BoardJoin,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await board_service.join_board(data.join_code, current_user, db)


@router.get("/{board_id}")
async def get_board(
    board_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    board = await board_service.get_board_detail(board_id, current_user.id, db)

    columns_data = []
    for col in sorted(board.columns, key=lambda c: c.position):
        cards_data = [CardOut.model_validate(card) for card in col.cards]
        columns_data.append({
            **ColumnOut.model_validate(col).model_dump(),
            "cards": [c.model_dump(mode="json") for c in cards_data],
        })

    members = [UserOut.model_validate(m.user) for m in board.members]

    return {
        **BoardOut.model_validate(board).model_dump(mode="json"),
        "columns": columns_data,
        "members": [m.model_dump() for m in members],
    }


@router.patch("/{board_id}", response_model=BoardOut)
async def update_board(
    board_id: str,
    data: BoardUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await board_service.update_board(board_id, data, current_user, db)


@router.get("/{board_id}/members", response_model=list[UserOut])
async def get_members(
    board_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await board_service.get_board_members(board_id, current_user.id, db)


@router.get("/{board_id}/activity", response_model=list[ActivityOut])
async def get_activity(
    board_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await activity_service.get_board_activity(board_id, db)
