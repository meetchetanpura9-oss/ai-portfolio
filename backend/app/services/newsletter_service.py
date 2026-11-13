"""
Subscriber lifecycle: consent → confirmation → active → unsubscribe, plus Resend contact sync.

Invariants enforced here (and relied on by the campaign sender):
- Only confirmed subscribers are ever created as Resend contacts.
- A subscriber who is not "active" is pushed to Resend as unsubscribed.
- An unsubscribed address only becomes active again through a new consent + confirmation.
- Raw tokens are never stored or logged; the database holds SHA-256 hashes only.
"""

import base64
import hashlib
import hmac
import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.models.newsletter_model import NewsletterSubscriber
from app.services import newsletter_emails, resend_client
from app.services.resend_client import ResendError

logger = logging.getLogger(__name__)

CONSENT_TEXT = (
    "I agree to receive Meet Chetanpura's newsletter by email and understand "
    "I can unsubscribe at any time."
)
# Do not re-send a confirmation email more often than this per address.
CONFIRMATION_RESEND_SECONDS = 120


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime | None) -> datetime | None:
    """SQLite returns naive datetimes; treat them as UTC so comparisons work everywhere."""
    if value is not None and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    return f"{local[:1]}***@{domain}" if domain else "***"


# --- Tokens ------------------------------------------------------------------------
def _secret(settings: Settings) -> bytes:
    secret = settings.NEWSLETTER_CONFIRMATION_SECRET.strip()
    if not secret:
        from app.services.auth_service import JWT_SECRET
        secret = JWT_SECRET
    return secret.encode("utf-8")


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def new_confirmation_token() -> tuple[str, str]:
    """Returns (raw token for the email link, hash to store)."""
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


def unsubscribe_token(settings: Settings, subscriber: NewsletterSubscriber) -> str:
    """Stateless signed token. It does not expire: an unsubscribe link must keep working."""
    message = f"unsubscribe:{subscriber.id}:{subscriber.email}".encode("utf-8")
    signature = hmac.new(_secret(settings), message, hashlib.sha256).digest()
    return f"{subscriber.id}.{base64.urlsafe_b64encode(signature).decode('ascii').rstrip('=')}"


def subscriber_from_unsubscribe_token(db: Session, settings: Settings, token: str) -> NewsletterSubscriber | None:
    subscriber_id, _, _signature = (token or "").partition(".")
    if not subscriber_id.isdigit() or len(token) > 200:
        return None
    subscriber = db.get(NewsletterSubscriber, int(subscriber_id))
    if subscriber is None:
        return None
    if not hmac.compare_digest(unsubscribe_token(settings, subscriber), token):
        return None
    return subscriber


def confirm_url(settings: Settings, token: str) -> str:
    return f"{settings.app_base_url}/newsletter/confirm?token={token}"


def unsubscribe_url(settings: Settings, subscriber: NewsletterSubscriber) -> str:
    return f"{settings.app_base_url}/newsletter/unsubscribe?token={unsubscribe_token(settings, subscriber)}"


def one_click_unsubscribe_url(settings: Settings, subscriber: NewsletterSubscriber, api_base: str) -> str:
    return f"{api_base.rstrip('/')}/newsletter/unsubscribe?token={unsubscribe_token(settings, subscriber)}"


# --- Resend contact sync -----------------------------------------------------------
def sync_subscriber_to_resend(db: Session, subscriber: NewsletterSubscriber, settings: Settings | None = None) -> bool:
    """
    Push this subscriber's state to Resend. Returns True when Resend is up to date.
    On failure the row keeps resend_sync_pending=True so a later sync (or the pre-send
    check) retries it — a campaign is never sent while a sync is outstanding.
    """
    settings = settings or get_settings()
    should_receive = subscriber.status == "active"

    if not should_receive and not subscriber.resend_contact_id:
        subscriber.resend_sync_pending = False  # never pushed to Resend: nothing to undo
        db.commit()
        return True

    if not settings.resend_enabled:
        subscriber.resend_sync_pending = True
        db.commit()
        return False

    segment_id = settings.newsletter_segment_id or None
    try:
        if should_receive:
            if subscriber.resend_contact_id:
                resend_client.update_contact(subscriber.resend_contact_id, unsubscribed=False)
            else:
                try:
                    subscriber.resend_contact_id = resend_client.create_contact(
                        subscriber.email, subscriber.first_name, segment_id) or None
                except ResendError as exc:
                    if exc.outcome_unknown or exc.status == 429:
                        raise
                    # Most likely the contact already exists in Resend: update it by email.
                    subscriber.resend_contact_id = resend_client.update_contact(
                        subscriber.email, unsubscribed=False) or None
            if segment_id and subscriber.resend_contact_id:
                resend_client.add_contact_to_segment(subscriber.resend_contact_id, segment_id)
        else:
            resend_client.update_contact(subscriber.resend_contact_id, unsubscribed=True)
        subscriber.resend_sync_pending = False
        db.commit()
        return True
    except ResendError as exc:
        logger.warning("Resend contact sync failed for subscriber %s: %s", subscriber.id, exc)
        subscriber.resend_sync_pending = True
        db.commit()
        return False


# --- Lifecycle ---------------------------------------------------------------------
def start_subscription(db: Session, *, email: str, first_name: str | None, source: str,
                       ip: str | None, settings: Settings) -> tuple[NewsletterSubscriber, str | None, bool]:
    """
    Record consent for an address and decide what to send.

    Returns (subscriber, raw_confirmation_token | None, activated_now).
    - token set      → caller sends the confirmation email
    - activated_now  → double opt-in is off; caller runs the post-confirmation steps
    Addresses that are already active, or blocked after a bounce/complaint, get nothing.
    """
    now = utcnow()
    subscriber = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()

    if subscriber is not None:
        if subscriber.status == "active":
            return subscriber, None, False
        if subscriber.status == "suppressed":
            return subscriber, None, False
        last_sent = as_utc(subscriber.confirmation_sent_at)
        if (subscriber.status == "pending" and last_sent
                and (now - last_sent).total_seconds() < CONFIRMATION_RESEND_SECONDS):
            return subscriber, None, False  # a confirmation email was sent moments ago
    else:
        subscriber = NewsletterSubscriber(email=email, subscribed_at=now)
        db.add(subscriber)

    if first_name:
        subscriber.first_name = first_name
    subscriber.consent_given = True
    subscriber.consent_timestamp = now
    subscriber.consent_text = CONSENT_TEXT
    subscriber.consent_ip = ip
    subscriber.subscription_source = source
    subscriber.updated_at = now

    if not settings.NEWSLETTER_DOUBLE_OPT_IN:
        subscriber.status = "active"
        subscriber.confirmed_at = now
        subscriber.confirmation_token_hash = None
        subscriber.confirmation_expires_at = None
        subscriber.resend_sync_pending = True
        db.commit()
        return subscriber, None, True

    token, token_hash = new_confirmation_token()
    subscriber.status = "pending"
    subscriber.confirmation_token_hash = token_hash
    subscriber.confirmation_expires_at = now + timedelta(hours=settings.NEWSLETTER_CONFIRMATION_HOURS)
    subscriber.confirmation_sent_at = now
    db.commit()
    return subscriber, token, False


def confirm_subscription(db: Session, token: str) -> tuple[str, NewsletterSubscriber | None]:
    """
    Returns (result, subscriber) where result is:
      "confirmed"  first successful confirmation
      "already"    this link was already used (idempotent)
      "expired"    token is past its expiry
      "invalid"    unknown token
    """
    if not token or len(token) > 200:
        return "invalid", None
    subscriber = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.confirmation_token_hash == hash_token(token))
        .first()
    )
    if subscriber is None:
        return "invalid", None
    if subscriber.status == "active":
        return "already", subscriber
    if subscriber.status != "pending":
        return "invalid", subscriber  # unsubscribed/suppressed since the email was sent
    expires = as_utc(subscriber.confirmation_expires_at)
    if expires is None or expires < utcnow():
        return "expired", subscriber

    # Conditional update: two simultaneous clicks cannot both "win".
    now = utcnow()
    won = db.execute(
        update(NewsletterSubscriber)
        .where(NewsletterSubscriber.id == subscriber.id, NewsletterSubscriber.status == "pending")
        # unsubscribed_at / unsubscribe_source are kept as history of an earlier opt-out.
        .values(status="active", confirmed_at=now, resend_sync_pending=True, updated_at=now)
    ).rowcount
    db.commit()
    db.refresh(subscriber)
    # The token hash is kept so a second click on the same link reports "already".
    return ("confirmed" if won else "already"), subscriber


def claim_welcome_email(db: Session, subscriber_id: int) -> bool:
    """Atomically mark the welcome email as sent. True only for the first caller."""
    won = db.execute(
        update(NewsletterSubscriber)
        .where(NewsletterSubscriber.id == subscriber_id, NewsletterSubscriber.welcome_sent_at.is_(None))
        .values(welcome_sent_at=utcnow())
    ).rowcount
    db.commit()
    return bool(won)


def unsubscribe(db: Session, subscriber: NewsletterSubscriber, source: str,
                status: str = "unsubscribed", commit: bool = True) -> bool:
    """Mark as unsubscribed/suppressed. Returns False when nothing changed (idempotent).
    Pass commit=False to leave the transaction to the caller (e.g. the webhook handler)."""
    if subscriber.status == status or (subscriber.status == "suppressed" and status == "unsubscribed"):
        return False
    now = utcnow()
    subscriber.status = status
    subscriber.unsubscribed_at = now
    subscriber.unsubscribe_source = source
    subscriber.confirmation_token_hash = None
    subscriber.confirmation_expires_at = None
    subscriber.resend_sync_pending = bool(subscriber.resend_contact_id)
    subscriber.updated_at = now
    if commit:
        db.commit()
    return True


# --- Background tasks (each opens its own session) -----------------------------------
def deliver_confirmation_email(subscriber_id: int, token: str) -> None:
    from app.database.connection import SessionLocal

    settings = get_settings()
    db = SessionLocal()
    try:
        subscriber = db.get(NewsletterSubscriber, subscriber_id)
        if subscriber is None or subscriber.status != "pending":
            return
        if not settings.resend_enabled:
            logger.warning("Confirmation email not sent for subscriber %s: RESEND_API_KEY is not set", subscriber_id)
            return
        newsletter_emails.send_confirmation_email(settings, subscriber.email, confirm_url(settings, token))
        logger.info("Confirmation email sent to subscriber %s", subscriber_id)
    except Exception as exc:  # noqa: BLE001 — a failed email must not crash the worker
        logger.error("Confirmation email failed for subscriber %s: %s", subscriber_id, exc)
        # Let the person retry immediately instead of waiting out the resend throttle.
        try:
            subscriber = db.get(NewsletterSubscriber, subscriber_id)
            if subscriber is not None:
                subscriber.confirmation_sent_at = None
                db.commit()
        except Exception:  # noqa: BLE001
            db.rollback()
    finally:
        db.close()


def complete_activation(subscriber_id: int, api_base: str) -> None:
    """After confirmation: sync the contact to Resend and send the welcome email once."""
    from app.database.connection import SessionLocal

    settings = get_settings()
    db = SessionLocal()
    try:
        subscriber = db.get(NewsletterSubscriber, subscriber_id)
        if subscriber is None or subscriber.status != "active":
            return
        sync_subscriber_to_resend(db, subscriber, settings)
        if not settings.resend_enabled:
            logger.warning("Welcome email not sent for subscriber %s: RESEND_API_KEY is not set", subscriber_id)
            return
        if not claim_welcome_email(db, subscriber_id):
            return  # already sent
        try:
            newsletter_emails.send_welcome_email(
                settings, subscriber.email, subscriber.id,
                unsubscribe_url(settings, subscriber),
                one_click_unsubscribe_url(settings, subscriber, api_base),
            )
            logger.info("Welcome email sent to subscriber %s", subscriber_id)
        except Exception as exc:  # noqa: BLE001
            logger.error("Welcome email failed for subscriber %s: %s", subscriber_id, exc)
            # Release the claim so an admin "resend" or re-confirmation can try again.
            db.execute(update(NewsletterSubscriber)
                       .where(NewsletterSubscriber.id == subscriber_id).values(welcome_sent_at=None))
            db.commit()
    finally:
        db.close()


def push_unsubscribe(subscriber_id: int) -> None:
    from app.database.connection import SessionLocal

    db = SessionLocal()
    try:
        subscriber = db.get(NewsletterSubscriber, subscriber_id)
        if subscriber is not None:
            sync_subscriber_to_resend(db, subscriber)
    finally:
        db.close()
