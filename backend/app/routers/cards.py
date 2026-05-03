from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.column import Column
from app.models.card import Card
from app.schemas.card import CardCreate, CardUpdate, CardMove, CardOut
from app.services import card_service, activity_service, email_service
from app.security import get_current_user
from app.realtime.socket_server import sio

router = APIRouter(tags=["cards"])


async def _board_id_for_column(column_id: str, db: AsyncSession) -> str:
    result = await db.execute(select(Column).where(Column.id == column_id))
    col = result.scalar_one_or_none()
    return col.board_id if col else ""


async def _emit_activity(board_id: str, user: User, message: str, db: AsyncSession):
    activity = await activity_service.log_activity(board_id, user.id, message, db)
    await sio.emit(
        "activity",
        {
            "id": activity.id,
            "message": message,
            "user_id": user.id,
            "display_name": user.display_name,
            "created_at": activity.created_at.isoformat(),
        },
        room=board_id,
    )


@router.post("/columns/{column_id}/cards", response_model=CardOut)
async def create_card(
    column_id: str,
    data: CardCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await card_service.create_card(column_id, data, current_user, db)
    board_id = await _board_id_for_column(column_id, db)
    card_out = CardOut.model_validate(card)

    await sio.emit("card_created", {"card": card_out.model_dump(mode="json")}, room=board_id)
    await _emit_activity(
        board_id, current_user,
        f"{current_user.display_name} created card '{card.title}'", db
    )

    if card.assigned_user_id and card.assigned_user:
        background_tasks.add_task(
            email_service.send_assignment_email,
            card.assigned_user.email,
            card.title,
            board_id,
            current_user.display_name,
        )

    return card_out


@router.patch("/cards/{card_id}", response_model=CardOut)
async def update_card(
    card_id: str,
    data: CardUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Capture old assignee before update
    pre = await db.execute(select(Card).where(Card.id == card_id))
    old_card = pre.scalar_one_or_none()
    old_assignee_id = old_card.assigned_user_id if old_card else None

    card = await card_service.update_card(card_id, data, current_user, db)
    board_id = await _board_id_for_column(card.column_id, db)
    card_out = CardOut.model_validate(card)

    await sio.emit("card_updated", {"card": card_out.model_dump(mode="json")}, room=board_id)
    await _emit_activity(
        board_id, current_user,
        f"{current_user.display_name} updated card '{card.title}'", db
    )

    assignee_changed = (
        "assigned_user_id" in data.model_fields_set
        and data.assigned_user_id != old_assignee_id
        and data.assigned_user_id is not None
    )
    if assignee_changed and card.assigned_user:
        background_tasks.add_task(
            email_service.send_assignment_email,
            card.assigned_user.email,
            card.title,
            board_id,
            current_user.display_name,
        )

    return card_out


@router.delete("/cards/{card_id}")
async def delete_card(
    card_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # card_service.delete_card returns a plain dict (card is gone after commit)
    card_data = await card_service.delete_card(card_id, current_user, db)
    board_id = await _board_id_for_column(card_data["column_id"], db)

    await sio.emit(
        "card_deleted",
        {"card_id": card_data["id"], "column_id": card_data["column_id"]},
        room=board_id,
    )
    await _emit_activity(
        board_id, current_user,
        f"{current_user.display_name} deleted card '{card_data['title']}'", db
    )

    return {"ok": True, "card_id": card_data["id"]}


@router.patch("/cards/{card_id}/move", response_model=CardOut)
async def move_card(
    card_id: str,
    data: CardMove,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pre = await db.execute(select(Card).where(Card.id == card_id))
    card_pre = pre.scalar_one_or_none()
    old_column_id = card_pre.column_id if card_pre else ""

    card = await card_service.move_card(card_id, data.column_id, current_user, db)
    board_id = await _board_id_for_column(card.column_id, db)
    card_out = CardOut.model_validate(card)

    await sio.emit(
        "card_moved",
        {
            "card": card_out.model_dump(mode="json"),
            "old_column_id": old_column_id,
            "new_column_id": data.column_id,
        },
        room=board_id,
    )
    await _emit_activity(
        board_id, current_user,
        f"{current_user.display_name} moved card '{card.title}'", db
    )

    return card_out
