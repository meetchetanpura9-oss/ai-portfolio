"""
Admin-only email diagnostics: see which provider is configured and send a test alert.
Never returns API keys or passwords.
"""

from fastapi import APIRouter, Depends

from app.core.config import get_settings
from app.models.user_model import User
from app.services.auth_service import get_current_user
from app.services.email_delivery import email_provider_status, send_test_alert

router = APIRouter(prefix="/admin/notifications", tags=["Notifications"])


@router.get("/status", summary="Show email notification configuration (no secrets)")
def notification_status(current_user: User = Depends(get_current_user)):
    return email_provider_status(get_settings())


@router.post("/test", summary="Send a test alert to ADMIN_EMAIL")
async def notification_test(current_user: User = Depends(get_current_user)):
    settings = get_settings()
    ok, detail = await send_test_alert(settings)
    return {"sent": ok, "to": settings.ADMIN_EMAIL, "detail": detail}
