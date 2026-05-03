import random
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.board import Board, BoardMember
from app.models.column import Column
from app.models.user import User
from app.schemas.board import BoardCreate, BoardUpdate


def _generate_join_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


async def _ensure_member(board_id: str, user_id: str, db: AsyncSession) -> Board:
    result = await db.execute(
        select(Board).where(Board.id == board_id)
    )
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    member = await db.execute(
        select(BoardMember).where(
            BoardMember.board_id == board_id,
            BoardMember.user_id == user_id,
        )
    )
    if not member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a board member")
    return board


async def create_board(data: BoardCreate, user: User, db: AsyncSession) -> Board:
    # Ensure unique join code
    while True:
        code = _generate_join_code()
        existing = await db.execute(select(Board).where(Board.join_code == code))
        if not existing.scalar_one_or_none():
            break

    board = Board(name=data.name, join_code=code, owner_id=user.id)
    db.add(board)
    await db.flush()

    # Add owner as member
    db.add(BoardMember(board_id=board.id, user_id=user.id))

    # Create default columns
    for pos, name in enumerate(["To Do", "In Progress", "Done"], start=1):
        db.add(Column(board_id=board.id, name=name, position=pos))

    await db.commit()
    await db.refresh(board)
    return board


async def get_user_boards(user_id: str, db: AsyncSession) -> list[Board]:
    result = await db.execute(
        select(Board)
        .join(BoardMember, Board.id == BoardMember.board_id)
        .where(BoardMember.user_id == user_id)
        .order_by(Board.created_at.desc())
    )
    return list(result.scalars().all())


async def get_board_detail(board_id: str, user_id: str, db: AsyncSession) -> Board:
    await _ensure_member(board_id, user_id, db)

    result = await db.execute(
        select(Board)
        .options(
            selectinload(Board.columns).selectinload(Column.cards),
            selectinload(Board.members).selectinload(BoardMember.user),
        )
        .where(Board.id == board_id)
    )
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


async def join_board(join_code: str, user: User, db: AsyncSession) -> Board:
    result = await db.execute(select(Board).where(Board.join_code == join_code))
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found with that join code")

    existing = await db.execute(
        select(BoardMember).where(
            BoardMember.board_id == board.id,
            BoardMember.user_id == user.id,
        )
    )
    if not existing.scalar_one_or_none():
        db.add(BoardMember(board_id=board.id, user_id=user.id))
        await db.commit()

    return board


async def update_board(board_id: str, data: BoardUpdate, user: User, db: AsyncSession) -> Board:
    result = await db.execute(select(Board).where(Board.id == board_id))
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if board.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the board owner can update settings")

    if data.deadline_alert_hours is not None:
        board.deadline_alert_hours = data.deadline_alert_hours

    await db.commit()
    await db.refresh(board)
    return board


async def get_board_members(board_id: str, user_id: str, db: AsyncSession) -> list[User]:
    await _ensure_member(board_id, user_id, db)
    result = await db.execute(
        select(User)
        .join(BoardMember, User.id == BoardMember.user_id)
        .where(BoardMember.board_id == board_id)
    )
    return list(result.scalars().all())
