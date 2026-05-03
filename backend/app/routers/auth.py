from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import (
    UserRegister, UserLogin, TokenOut, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest, MessageOut,
)
from app.services import auth_service
from app.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=MessageOut)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Create account. Returns a success message — user must log in separately."""
    return await auth_service.register_user(data, db)


@router.post("/login", response_model=TokenOut)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate and return a JWT token."""
    return await auth_service.login_user(data, db)


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user


@router.post("/forgot-password", response_model=MessageOut)
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Request a password reset link. Always returns success (doesn't reveal if email exists)."""
    return await auth_service.forgot_password(data.email, db)


@router.post("/reset-password", response_model=MessageOut)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Validate reset token and set a new password."""
    return await auth_service.reset_password(data.token, data.new_password, db)
