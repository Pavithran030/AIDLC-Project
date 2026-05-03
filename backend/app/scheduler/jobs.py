from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models.card import Card
from app.models.column import Column
from app.models.board import Board
from app.realtime.socket_server import sio
from app.services.email_service import send_deadline_email


async def check_deadlines():
    """Runs every 15 minutes. Finds cards approaching their deadline and alerts the board."""
    try:
        async with AsyncSessionLocal() as db:
            now = datetime.now(timezone.utc)

            boards_result = await db.execute(select(Board))
            boards = boards_result.scalars().all()

            for board in boards:
                threshold = timedelta(hours=board.deadline_alert_hours)
                cutoff = now + threshold

                result = await db.execute(
                    select(Card)
                    .join(Column, Card.column_id == Column.id)
                    .options(selectinload(Card.assigned_user))
                    .where(
                        Column.board_id == board.id,
                        Card.deadline.isnot(None),
                        Card.deadline > now,
                        Card.deadline <= cutoff,
                    )
                )
                cards = result.scalars().all()

                if not cards:
                    continue

                alert_data = [
                    {
                        "card_id": c.id,
                        "card_title": c.title,
                        "deadline": c.deadline.isoformat() if c.deadline else None,
                    }
                    for c in cards
                ]

                await sio.emit("deadline_alert", {"cards": alert_data}, room=board.id)

                for card in cards:
                    if card.assigned_user and card.assigned_user.email and card.deadline:
                        try:
                            await send_deadline_email(
                                to_email=card.assigned_user.email,
                                card_title=card.title,
                                board_name=board.name,
                                deadline=card.deadline,
                            )
                        except Exception:
                            pass

    except Exception as e:
        # Never crash the scheduler — just log and continue
        print(f"[scheduler] check_deadlines error: {e}")
