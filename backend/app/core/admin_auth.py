"""Optional API key guard for admin endpoints."""

from fastapi import Header, HTTPException, Query, status

from app.core.config import get_settings


def verify_admin_key(
    x_admin_key: str | None = Header(default=None),
    admin_key: str | None = Query(default=None),
) -> None:
    settings = get_settings()
    if not settings.ADMIN_API_KEY:
        return  # dev mode - no key required

    provided_key = x_admin_key or admin_key
    if provided_key != settings.ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin API key",
        )
