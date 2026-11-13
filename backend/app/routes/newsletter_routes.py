"""
Public newsletter endpoints: subscribe (with consent), confirm, unsubscribe.

Responses never reveal whether an address is already on the list, and tokens are
never written to the logs.
"""

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.db import get_db
from app.schemas.newsletter_schema import NewsletterSubscribe, TokenPayload
from app.services import newsletter_service as svc
from app.services.rate_limiter import RateLimiter, get_client_ip

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

# Separate buckets so newsletter traffic and the contact form do not throttle each other.
subscribe_limiter = RateLimiter()
token_limiter = RateLimiter(max_requests=20, window_seconds=60)  # confirm + unsubscribe links

UNAVAILABLE = "Subscriptions are temporarily unavailable. Please try again in a few minutes."
PENDING_MESSAGE = (
    "Almost there! If this address is not already subscribed, a confirmation email is on its way. "
    "Please check your inbox (and spam folder) to confirm."
)
ACTIVE_MESSAGE = "Thank you! You are subscribed to the newsletter."
INVALID_UNSUBSCRIBE = "This unsubscribe link is not valid."


def api_base_url(request: Request) -> str:
    """Public URL of this API (used in one-click unsubscribe headers and image URLs)."""
    configured = get_settings().API_BASE_URL.strip().rstrip("/")
    if configured:
        return configured
    base = str(request.base_url).rstrip("/")
    host = request.url.hostname or ""
    # Behind Render's proxy the app sees http://; the public URL is always https.
    if base.startswith("http://") and host not in ("localhost", "127.0.0.1", "testserver"):
        base = "https://" + base[len("http://"):]
    return base


@router.post("/subscribe", status_code=status.HTTP_201_CREATED, summary="Subscribe to newsletter")
def subscribe(
    payload: NewsletterSubscribe,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Record consent and start the double opt-in. The address only becomes an active
    subscriber after the link in the confirmation email is opened.
    """
    ip = get_client_ip(request)
    subscribe_limiter.check(ip)
    settings = get_settings()

    if not payload.consent:
        raise HTTPException(
            status_code=422,
            detail="Please tick the consent box to subscribe to the newsletter.",
        )
    if payload.website:  # honeypot filled: a bot. Answer as usual, store nothing.
        return {"message": PENDING_MESSAGE}

    email = payload.email.lower().strip()
    try:
        subscriber, token, activated = svc.start_subscription(
            db, email=email, first_name=payload.first_name,
            source=payload.source or "website", ip=ip, settings=settings,
        )
    except IntegrityError:
        db.rollback()  # two simultaneous requests for the same address
        return {"message": PENDING_MESSAGE}
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Newsletter: database unavailable")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=UNAVAILABLE) from exc

    if activated:
        background_tasks.add_task(svc.complete_activation, subscriber.id, api_base_url(request))
        return {"message": ACTIVE_MESSAGE}
    if token:
        background_tasks.add_task(svc.deliver_confirmation_email, subscriber.id, token)
    return {"message": PENDING_MESSAGE}


def _confirm(token: str, request: Request, background_tasks: BackgroundTasks, db: Session) -> dict:
    token_limiter.check(get_client_ip(request))
    try:
        result, subscriber = svc.confirm_subscription(db, token)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Newsletter confirm: database error")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=UNAVAILABLE) from exc

    if result == "confirmed":
        # Sync to Resend + welcome email (sent at most once).
        background_tasks.add_task(svc.complete_activation, subscriber.id, api_base_url(request))
        return {"status": "confirmed", "message": "Your subscription is confirmed. Welcome aboard!"}
    if result == "already":
        return {"status": "already_confirmed", "message": "Your subscription was already confirmed."}
    if result == "expired":
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This confirmation link has expired. Please subscribe again to get a new one.",
        )
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                        detail="This confirmation link is not valid.")


@router.post("/confirm", summary="Confirm a subscription (double opt-in)")
def confirm(
    payload: TokenPayload,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    return _confirm(payload.token, request, background_tasks, db)


@router.get("/confirm", summary="Confirm a subscription from a plain link")
def confirm_get(
    request: Request,
    background_tasks: BackgroundTasks,
    token: str = Query(min_length=10, max_length=200),
    db: Session = Depends(get_db),
):
    """Same as POST /newsletter/confirm, for clients that open the API link directly."""
    return _confirm(token, request, background_tasks, db)


@router.get("/unsubscribe", summary="Look up an unsubscribe link")
def unsubscribe_info(
    request: Request,
    token: str = Query(min_length=3, max_length=200),
    db: Session = Depends(get_db),
):
    """
    Validates the link and returns the masked address. It does not unsubscribe: mail
    scanners pre-open links, so the change only happens on the POST below.
    """
    token_limiter.check(get_client_ip(request))
    subscriber = svc.subscriber_from_unsubscribe_token(db, get_settings(), token)
    if subscriber is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_UNSUBSCRIBE)
    return {
        "email": svc.mask_email(subscriber.email),
        "status": "unsubscribed" if subscriber.status in ("unsubscribed", "suppressed") else "subscribed",
    }


@router.post("/unsubscribe", summary="Unsubscribe (also RFC 8058 one-click)")
def unsubscribe(
    request: Request,
    background_tasks: BackgroundTasks,
    token: str = Query(min_length=3, max_length=200),
    db: Session = Depends(get_db),
):
    token_limiter.check(get_client_ip(request))
    subscriber = svc.subscriber_from_unsubscribe_token(db, get_settings(), token)
    if subscriber is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_UNSUBSCRIBE)
    try:
        changed = svc.unsubscribe(db, subscriber, source="link")
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Newsletter unsubscribe: database error")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="We could not process this right now. Please try again shortly.") from exc
    if changed:
        background_tasks.add_task(svc.push_unsubscribe, subscriber.id)
    return {
        "status": "unsubscribed",
        "already": not changed,
        "message": "You have been unsubscribed. You will not receive further newsletter emails.",
    }
