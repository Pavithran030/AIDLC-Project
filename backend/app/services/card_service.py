from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.card import Card
from app.models.column import Column
from app.models.board import BoardMember
from app.models.user import User
from app.schemas.card import CardCreate, CardUpdate


async def _get_column_and_check_membership(
    column_id: str, user_id: str, db: AsyncSession
) -> Column:
    result = await db.execute(select(Column).where(Column.id == column_id))
    column = result.scalar_one_or_none()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    member = await db.execute(
        select(BoardMember).where(
            BoardMember.board_id == column.board_id,
            BoardMember.user_id == user_id,
        )
    )
    if not member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a board member")
    return column


async def _get_card_and_check_membership(
    card_id: str, user_id: str, db: AsyncSession
) -> Card:
    result = await db.execute(
        select(Card)
        .options(selectinload(Card.assigned_user))
        .where(Card.id == card_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    col_result = await db.execute(select(Column).where(Column.id == card.column_id))
    column = col_result.scalar_one_or_none()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    member = await db.execute(
        select(BoardMember).where(
            BoardMember.board_id == column.board_id,
            BoardMember.user_id == user_id,
        )
    )
    if not member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a board member")
    return card


async def _load_card_with_user(card_id: str, db: AsyncSession) -> Card:
    result = await db.execute(
        select(Card)
        .options(selectinload(Card.assigned_user))
        .where(Card.id == card_id)
    )
    return result.scalar_one()


async def create_card(
    column_id: str, data: CardCreate, user: User, db: AsyncSession
) -> Card:
    await _get_column_and_check_membership(column_id, user.id, db)

    card = Card(
        column_id=column_id,
        title=data.title,
        description=data.description,
        assigned_user_id=data.assigned_user_id,
        deadline=data.deadline,
    )
    db.add(card)
    await db.commit()
    return await _load_card_with_user(card.id, db)


async def update_card(
    card_id: str, data: CardUpdate, user: User, db: AsyncSession
) -> Card:
    card = await _get_card_and_check_membership(card_id, user.id, db)

    fields = data.model_fields_set
    if "title" in fields and data.title is not None:
        card.title = data.title
    if "description" in fields:
        card.description = data.description  # allows clearing to None
    if "assigned_user_id" in fields:
        card.assigned_user_id = data.assigned_user_id  # allows clearing to None
    if "deadline" in fields:
        card.deadline = data.deadline  # allows clearing to None

    # Explicitly set updated_at since onupdate lambda is unreliable with async
    card.updated_at = datetime.now(timezone.utc)

    await db.commit()
    return await _load_card_with_user(card.id, db)


async def delete_card(card_id: str, user: User, db: AsyncSession) -> dict:
    """Returns card data dict before deletion so callers can use it after commit."""
    card = await _get_card_and_check_membership(card_id, user.id, db)

    # Capture needed data before the object is deleted
    card_data = {
        "id": card.id,
        "column_id": card.column_id,
        "title": card.title,
    }

    await db.delete(card)
    await db.commit()
    return card_data


async def move_card(
    card_id: str, target_column_id: str, user: User, db: AsyncSession
) -> Card:
    card = await _get_card_and_check_membership(card_id, user.id, db)
    await _get_column_and_check_membership(target_column_id, user.id, db)

    card.column_id = target_column_id
    card.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return await _load_card_with_user(card.id, db)
