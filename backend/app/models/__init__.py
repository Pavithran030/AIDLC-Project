# Import all models here so SQLAlchemy's Base.metadata is fully populated
# whenever this package is imported — required for create_all.

from app.models.user import User          # noqa: F401
from app.models.board import Board, BoardMember  # noqa: F401
from app.models.column import Column      # noqa: F401
from app.models.card import Card          # noqa: F401
from app.models.activity import ActivityLog  # noqa: F401
