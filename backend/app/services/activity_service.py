from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.activity import ActivityLog
from app.schemas.activity import ActivityOut


async def log_activity(board_id: str, user_id: str, message: str, db: AsyncSession) -> ActivityLog:
    entry = ActivityLog(board_id=board_id, user_id=user_id, message=message)
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


async def get_board_activity(board_id: str, db: AsyncSession) -> list[ActivityOut]:
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.board_id == board_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(20)
    )
    entries = result.scalars().all()
    return [ActivityOut.model_validate(e) for e in reversed(entries)]
