from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.card import Card
from app.models.column import Column
from app.models.board import BoardMember
from app.schemas.card import CardCreate, CardUpdate


async def _check_membership(board_id: str, user_id: str, db: AsyncSession):
    """Single query to verify board membership."""
    member = await db.execute(
        select(BoardMember).where(
            BoardMember.board_id == board_id,
            BoardMember.user_id == user_id,
        )
    )
    if not member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a board member")


async def _get_column(column_id: str, db: AsyncSession) -> Column:
    result = await db.execute(select(Column).where(Column.id == column_id))
    column = result.scalar_one_or_none()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
    return column


async def _get_card_with_user(card_id: str, db: AsyncSession) -> Card:
    """Load card + assigned_user in one query."""
    result = await db.execute(
        select(Card)
        .options(selectinload(Card.assigned_user))
        .where(Card.id == card_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


async def create_card(
    column_id: str, data: CardCreate, user_id: str, db: AsyncSession
) -> Card:
    # 1 query: get column + board_id
    column = await _get_column(column_id, db)
    # 1 query: check membership
    await _check_membership(column.board_id, user_id, db)

    card = Card(
        column_id=column_id,
        title=data.title,
        description=data.description,
        assigned_user_id=data.assigned_user_id,
        deadline=data.deadline,
    )
    db.add(card)
    await db.flush()   # get card.id without closing transaction
    card_id = card.id
    await db.commit()

    # 1 query: reload with assigned_user
    return await _get_card_with_user(card_id, db)


async def update_card(
    card_id: str, data: CardUpdate, user_id: str, db: AsyncSession
) -> Card:
    # 1 query: get card + assigned_user + column in one go
    result = await db.execute(
        select(Card)
        .options(selectinload(Card.assigned_user))
        .join(Column, Card.column_id == Column.id)
        .where(Card.id == card_id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # 1 query: check membership using column's board_id from the card's column
    col = await _get_column(card.column_id, db)
    await _check_membership(col.board_id, user_id, db)

    fields = data.model_fields_set
    if "title" in fields and data.title is not None:
        card.title = data.title
    if "description" in fields:
        card.description = data.description
    if "assigned_user_id" in fields:
        card.assigned_user_id = data.assigned_user_id
    if "deadline" in fields:
        card.deadline = data.deadline

    card.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return await _get_card_with_user(card.id, db)


async def delete_card(card_id: str, user_id: str, db: AsyncSession) -> dict:
    """Returns card data dict before deletion."""
    card = await _get_card_with_user(card_id, db)
    col = await _get_column(card.column_id, db)
    await _check_membership(col.board_id, user_id, db)

    card_data = {"id": card.id, "column_id": card.column_id, "title": card.title}
    await db.delete(card)
    await db.commit()
    return card_data


async def move_card(
    card_id: str, target_column_id: str, user_id: str, db: AsyncSession
) -> Card:
    card = await _get_card_with_user(card_id, db)
    col = await _get_column(card.column_id, db)
    await _check_membership(col.board_id, user_id, db)

    # Verify target column exists and belongs to same board
    target_col = await _get_column(target_column_id, db)
    if target_col.board_id != col.board_id:
        raise HTTPException(status_code=400, detail="Cannot move card to a different board")

    card.column_id = target_column_id
    card.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return await _get_card_with_user(card.id, db)
