"""
Resend webhook receiver: delivery analytics and provider-side unsubscribes.

Security
- Every request must carry a valid Svix signature (Resend signs webhooks with Svix):
  HMAC-SHA256 over "{svix-id}.{svix-timestamp}.{raw body}" with the base64 secret that
  follows "whsec_". Requests older than 5 minutes are rejected (replay protection).
- The raw body is verified before it is parsed.
- Each svix-id is stored once; a redelivered event is acknowledged and ignored.
"""

import base64
import hashlib
import hmac
import json
import logging
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.db import get_db
from app.models.newsletter_model import (
    NewsletterCampaign,
    NewsletterEmailEvent,
    NewsletterSubscriber,
    NewsletterWebhookEvent,
)
from app.services import newsletter_service as svc

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

TOLERANCE_SECONDS = 5 * 60
MAX_BODY_BYTES = 256 * 1024
_EMAIL_EVENTS = {
    "email.sent": "sent",
    "email.delivered": "delivered",
    "email.delivery_delayed": "delivery_delayed",
    "email.bounced": "bounced",
    "email.complained": "complained",
    "email.opened": "opened",
    "email.clicked": "clicked",
    "email.failed": "failed",
    "email.suppressed": "suppressed",
}


def verify_svix_signature(secret: str, svix_id: str, svix_timestamp: str, signature_header: str, body: bytes) -> bool:
    try:
        timestamp = int(svix_timestamp)
    except (TypeError, ValueError):
        return False
    if abs(time.time() - timestamp) > TOLERANCE_SECONDS:
        return False
    try:
        key = base64.b64decode(secret.strip().removeprefix("whsec_"))
    except (ValueError, TypeError):
        return False
    signed = svix_id.encode() + b"." + svix_timestamp.encode() + b"." + body
    expected = base64.b64encode(hmac.new(key, signed, hashlib.sha256).digest()).decode()
    # The header may hold several space-separated "v1,<signature>" entries (key rotation).
    for candidate in (signature_header or "").split():
        version, _, value = candidate.partition(",")
        if version == "v1" and hmac.compare_digest(value, expected):
            return True
    return False


def _parse_time(value) -> datetime:
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        return datetime.now(timezone.utc)


def _handle_email_event(db: Session, svix_id: str, event_type: str, payload: dict) -> None:
    data = payload.get("data") or {}
    kind = _EMAIL_EVENTS[event_type]
    recipients = data.get("to") or []
    recipient = str(recipients[0]).lower().strip() if recipients else ""
    subscriber = (
        db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == recipient).first()
        if recipient else None
    )
    broadcast_id = data.get("broadcast_id")
    campaign = (
        db.query(NewsletterCampaign).filter(NewsletterCampaign.resend_broadcast_id == broadcast_id).first()
        if broadcast_id else None
    )

    # Analytics rows are kept for campaign (broadcast) emails only.
    if campaign is not None and data.get("email_id"):
        db.add(NewsletterEmailEvent(
            campaign_id=campaign.id,
            subscriber_id=subscriber.id if subscriber else None,
            resend_broadcast_id=str(broadcast_id),
            resend_email_id=str(data["email_id"]),
            event_type=kind,
            occurred_at=_parse_time(payload.get("created_at")),
            svix_id=svix_id,
        ))
        if kind == "sent" and campaign.status in ("scheduled", "sending"):
            campaign.status = "sent"
            campaign.sent_at = campaign.sent_at or _parse_time(payload.get("created_at"))

    # Hard bounces and spam complaints permanently stop email to that address.
    if subscriber is not None and subscriber.status in ("active", "pending"):
        bounce_type = str((data.get("bounce") or {}).get("type", "")).lower()
        if kind == "complained" or (kind == "bounced" and bounce_type not in ("transient", "temporary")):
            svc.unsubscribe(db, subscriber, source=kind, status="suppressed", commit=False)
            logger.info("Subscriber %s suppressed after %s", subscriber.id, kind)


def _handle_contact_event(db: Session, event_type: str, payload: dict) -> None:
    data = payload.get("data") or {}
    email = str(data.get("email", "")).lower().strip()
    if not email:
        return
    subscriber = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    if subscriber is None:
        return

    if event_type == "contact.deleted":
        subscriber.resend_contact_id = None
        subscriber.resend_sync_pending = subscriber.status == "active"
        return

    if data.get("unsubscribed") is True:
        # Unsubscribed through Resend's own link: mirror it locally.
        if subscriber.status in ("active", "pending"):
            svc.unsubscribe(db, subscriber, source="resend", commit=False)
        subscriber.resend_sync_pending = False
    elif data.get("unsubscribed") is False and subscriber.status != "active":
        # Resend shows the contact as subscribed but our record says otherwise. Local
        # consent wins: never reactivate, and push the opt-out back before the next send.
        subscriber.resend_sync_pending = True


@router.post("/resend", summary="Resend webhook (signature verified)")
async def resend_webhook(request: Request, db: Session = Depends(get_db)):
    secret = get_settings().RESEND_WEBHOOK_SECRET.strip()
    if not secret:
        # Without a secret nothing can be verified, so nothing is accepted.
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Webhook is not configured")

    body = await request.body()
    if len(body) > MAX_BODY_BYTES:
        raise HTTPException(413, "Payload too large")

    svix_id = request.headers.get("svix-id", "")
    if not svix_id or not verify_svix_signature(
        secret, svix_id, request.headers.get("svix-timestamp", ""),
        request.headers.get("svix-signature", ""), body,
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid signature")

    try:
        payload = json.loads(body.decode("utf-8"))
        event_type = str(payload["type"])
    except (ValueError, KeyError, TypeError) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Malformed payload") from exc

    try:
        # Recording the delivery and applying its effects happen in one transaction:
        # either both are stored or neither is, and a retry is then processed normally.
        db.add(NewsletterWebhookEvent(svix_id=svix_id[:120], event_type=event_type[:60]))
        db.flush()
        if event_type in _EMAIL_EVENTS:
            _handle_email_event(db, svix_id[:120], event_type, payload)
        elif event_type in ("contact.updated", "contact.deleted"):
            _handle_contact_event(db, event_type, payload)
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"status": "duplicate"}
    except Exception:
        db.rollback()
        logger.exception("Resend webhook processing failed (type=%s)", event_type)
        # 5xx makes Resend retry later.
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Processing failed")
    return {"status": "ok"}
