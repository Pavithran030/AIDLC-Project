import secrets
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserOut, TokenOut, MessageOut
from app.security import hash_password, verify_password, create_access_token

RESET_TOKEN_EXPIRE_MINUTES = 30


async def register_user(data: UserRegister, db: AsyncSession) -> MessageOut:
    """Create account. Does NOT issue a token — user must log in separately."""
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        display_name=data.display_name,
    )
    db.add(user)
    await db.commit()

    return MessageOut(message="Account created successfully. Please log in.")


async def login_user(data: UserLogin, db: AsyncSession) -> TokenOut:
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": user.id})
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


async def forgot_password(email: str, db: AsyncSession) -> MessageOut:
    """
    Generate a password reset token and store it on the user.
    Always returns a success message (don't reveal whether email exists).
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(
            minutes=RESET_TOKEN_EXPIRE_MINUTES
        )
        await db.commit()

        # Send email if configured, otherwise print to console for dev
        from app.services.email_service import send_reset_email
        await send_reset_email(user.email, token)

    # Always return the same message — don't reveal if email exists
    return MessageOut(
        message="If that email is registered, a password reset link has been sent."
    )


async def reset_password(token: str, new_password: str, db: AsyncSession) -> MessageOut:
    """Validate reset token and update the password."""
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    result = await db.execute(select(User).where(User.reset_token == token))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    now = datetime.now(timezone.utc)
    expires = user.reset_token_expires

    # Make expires timezone-aware if it came back naive from DB
    if expires and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if not expires or now > expires:
        raise HTTPException(status_code=400, detail="Reset token has expired")

    user.hashed_password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await db.commit()

    return MessageOut(message="Password updated successfully. You can now log in.")
