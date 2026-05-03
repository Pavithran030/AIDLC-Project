from datetime import datetime
from app.config import settings


def _get_mailer():
    """Build FastMail instance only when credentials are configured."""
    if not settings.MAIL_USERNAME or not settings.MAIL_FROM:
        return None
    from fastapi_mail import FastMail, ConnectionConfig
    conf = ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )
    return FastMail(conf)


async def _send(to_email: str, subject: str, body: str):
    mailer = _get_mailer()
    if not mailer:
        # Dev mode — print to console so the flow still works without SMTP
        print(f"\n{'='*60}")
        print(f"[DEV EMAIL] To: {to_email}")
        print(f"[DEV EMAIL] Subject: {subject}")
        print(f"[DEV EMAIL] Body:\n{body}")
        print(f"{'='*60}\n")
        return
    from fastapi_mail import MessageSchema, MessageType
    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=body,
        subtype=MessageType.plain,
    )
    try:
        await mailer.send_message(message)
    except Exception as e:
        print(f"[email] Failed to send to {to_email}: {e}")


async def send_reset_email(to_email: str, token: str):
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    await _send(
        to_email=to_email,
        subject="Reset your Syncwork password",
        body=(
            f"Hi,\n\n"
            f"You requested a password reset. Click the link below to set a new password.\n"
            f"This link expires in 30 minutes.\n\n"
            f"{reset_url}\n\n"
            f"If you didn't request this, ignore this email.\n"
        ),
    )


async def send_assignment_email(
    to_email: str, card_title: str, board_name: str, assigner_name: str
):
    await _send(
        to_email=to_email,
        subject=f"You've been assigned to '{card_title}'",
        body=(
            f"Hi,\n\n"
            f"{assigner_name} assigned you to the card '{card_title}' "
            f"on board '{board_name}'.\n\n"
            f"Log in to view it: {settings.FRONTEND_URL}\n"
        ),
    )


async def send_deadline_email(
    to_email: str, card_title: str, board_name: str, deadline: datetime
):
    await _send(
        to_email=to_email,
        subject=f"Deadline approaching: '{card_title}'",
        body=(
            f"Hi,\n\n"
            f"The card '{card_title}' on board '{board_name}' is due on "
            f"{deadline.strftime('%Y-%m-%d %H:%M UTC')}.\n\n"
            f"Log in to check it: {settings.FRONTEND_URL}\n"
        ),
    )
