"""
Newsletter campaigns: rendering, test sends, and delivery through Resend Broadcasts.

Delivery model
- Bulk sending is done by Resend (one Broadcast to one Segment), never by looping over
  subscribers in a web request.
- Only confirmed subscribers are ever synced into the Resend segment, and every opt-out is
  pushed back as `unsubscribed`, which Resend honours for Broadcasts. A send is refused
  while any of those pushes is still outstanding.
- A campaign moves draft → sending with a conditional UPDATE, so two clicks (or two
  browser tabs) can never dispatch the same campaign twice.
"""

import logging
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, update
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.newsletter_model import CaseStudy, NewsletterCampaign, NewsletterSubscriber
from app.services import resend_client
from app.services.markdown_renderer import UNSUBSCRIBE_PLACEHOLDER, render_markdown
from app.services.newsletter_emails import campaign_email_html, newsletter_sender
from app.services.newsletter_service import as_utc, sync_subscriber_to_resend, utcnow
from app.services.resend_client import ResendError

logger = logging.getLogger(__name__)

EDITABLE_STATUSES = ("draft", "failed")
MAX_SYNC_PER_REQUEST = 40  # keeps a single request well inside Resend's rate limit
MIN_SCHEDULE_LEAD = timedelta(minutes=2)
MAX_SCHEDULE_AHEAD = timedelta(days=30)


class CampaignError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


# --- Rendering ---------------------------------------------------------------------
def render_campaign_html(settings: Settings, content: str, preview_text: str | None = None) -> str:
    body = render_markdown(content, mode="email", base_url=settings.app_base_url)
    return campaign_email_html(settings, body, preview_text or "")


def draft_from_case_study(settings: Settings, study: CaseStudy) -> dict:
    """Prepare (not send) a newsletter draft announcing a published case study."""
    url = f"{settings.app_base_url}/case-studies/{study.slug}"
    parts: list[str] = [f"# {study.title}", ""]
    if study.cover_image_url:
        parts += [f"![{study.title}]({study.cover_image_url})", ""]
    if study.summary:
        parts += [study.summary.strip(), ""]
    highlights = [str(item) for item in (study.key_features or []) if item][:5]
    if highlights:
        parts += ["## Key highlights", ""] + [f"- {item}" for item in highlights] + [""]
    technologies = [str(item) for item in (study.technologies or []) if item][:10]
    if technologies:
        parts += [f"**Built with:** {', '.join(technologies)}", ""]
    parts += [
        f"[[button: Read the full case study | {url}]]",
        "",
        "---",
        "",
        f"More projects and experiments on [{settings.app_base_url.split('://')[-1]}]({settings.app_base_url}).",
    ]
    return {
        "title": f"Case study: {study.title}"[:200],
        "subject": f"New case study: {study.title}"[:200],
        "preview_text": (study.summary or "").strip()[:200] or None,
        "content": "\n".join(parts),
    }


# --- Recipients --------------------------------------------------------------------
def eligible_recipient_count(db: Session) -> int:
    return db.query(func.count(NewsletterSubscriber.id)).filter(NewsletterSubscriber.status == "active").scalar() or 0


def pending_sync_count(db: Session) -> int:
    return (
        db.query(func.count(NewsletterSubscriber.id))
        .filter(NewsletterSubscriber.resend_sync_pending.is_(True))
        .scalar() or 0
    )


def flush_pending_syncs(db: Session, settings: Settings, limit: int = MAX_SYNC_PER_REQUEST) -> int:
    """Push outstanding contact changes to Resend. Returns how many are still pending."""
    rows = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.resend_sync_pending.is_(True))
        .order_by(NewsletterSubscriber.id)
        .limit(limit)
        .all()
    )
    for index, subscriber in enumerate(rows):
        if index:
            time.sleep(0.15)  # stay under Resend's requests-per-second limit
        sync_subscriber_to_resend(db, subscriber, settings)
    return pending_sync_count(db)


def send_readiness(db: Session, settings: Settings, campaign: NewsletterCampaign | None = None) -> dict:
    """Everything the admin must see before confirming a send."""
    problems: list[str] = []
    if not settings.resend_enabled:
        problems.append("RESEND_API_KEY is not configured on the server.")
    if not settings.newsletter_segment_id:
        problems.append("RESEND_NEWSLETTER_SEGMENT_ID is not configured on the server.")
    eligible = eligible_recipient_count(db)
    if eligible == 0:
        problems.append("There are no active (confirmed) subscribers yet.")
    if campaign is not None:
        if not (campaign.subject or "").strip():
            problems.append("The campaign has no subject.")
        if not (campaign.content or "").strip():
            problems.append("The campaign has no content.")
        if campaign.status not in EDITABLE_STATUSES:
            problems.append(f"The campaign is already {campaign.status}.")
    return {
        "eligible_recipients": eligible,
        "pending_sync": pending_sync_count(db),
        "ready": not problems,
        "problems": problems,
    }


# --- Test send -----------------------------------------------------------------------
def send_test(settings: Settings, campaign: NewsletterCampaign) -> str:
    """Send the rendered campaign to ADMIN_EMAIL only. Never touches subscribers."""
    if not settings.resend_enabled:
        raise CampaignError("RESEND_API_KEY is not configured on the server.")
    if not (campaign.subject or "").strip():
        raise CampaignError("Add a subject before sending a test.")
    html = render_campaign_html(settings, campaign.content, campaign.preview_text)
    # The Resend placeholder is only filled in for Broadcasts; show a harmless link in tests.
    html = html.replace(UNSUBSCRIBE_PLACEHOLDER, f"{settings.app_base_url}/?unsubscribe-link-preview")
    try:
        return resend_client.send_email({
            "from": newsletter_sender(settings),
            "to": [settings.ADMIN_EMAIL],
            "subject": f"[TEST] {campaign.subject}",
            "html": html,
            "reply_to": settings.ADMIN_EMAIL,
            "tags": [{"name": "category", "value": "newsletter_test"}],
        })
    except ResendError as exc:
        raise CampaignError(f"Test email failed: {exc.detail}", 502) from exc


# --- Dispatch ------------------------------------------------------------------------
def _claim(db: Session, campaign_id: int) -> bool:
    """draft/failed → sending, atomically. Only one caller can ever win."""
    won = db.execute(
        update(NewsletterCampaign)
        .where(NewsletterCampaign.id == campaign_id, NewsletterCampaign.status.in_(EDITABLE_STATUSES))
        .values(status="sending", last_error=None, updated_at=utcnow())
    ).rowcount
    db.commit()
    return bool(won)


def _adopt_remote_status(campaign: NewsletterCampaign, remote: dict) -> bool:
    """Mirror Resend's broadcast status locally. Returns True when it shows the send went out."""
    status = str(remote.get("status", "")).lower()
    if status == "sent":
        campaign.status = "sent"
        campaign.sent_at = campaign.sent_at or utcnow()
        return True
    if status in ("queued", "sending"):
        campaign.status = "sending"
        campaign.sent_at = campaign.sent_at or utcnow()
        return True
    if status == "scheduled":
        campaign.status = "scheduled"
        return True
    if status in ("canceled", "cancelled"):
        campaign.status = "cancelled"
    return False


def validate_schedule(scheduled_at: datetime) -> datetime:
    when = as_utc(scheduled_at).astimezone(timezone.utc)
    now = utcnow()
    if when < now + MIN_SCHEDULE_LEAD:
        raise CampaignError("Choose a time at least 2 minutes in the future.")
    if when > now + MAX_SCHEDULE_AHEAD:
        raise CampaignError("Campaigns can be scheduled at most 30 days ahead.")
    return when


def dispatch(db: Session, settings: Settings, campaign: NewsletterCampaign, *,
             expected_recipients: int | None, scheduled_at: datetime | None = None) -> NewsletterCampaign:
    """Send now, or schedule when scheduled_at is given. Raises CampaignError on any problem."""
    when = validate_schedule(scheduled_at) if scheduled_at else None

    readiness = send_readiness(db, settings, campaign)
    if not readiness["ready"]:
        raise CampaignError(" ".join(readiness["problems"]), 409 if campaign.status not in EDITABLE_STATUSES else 400)

    if flush_pending_syncs(db, settings) > 0:
        raise CampaignError(
            "Some subscriber changes (new confirmations or unsubscribes) have not reached Resend yet. "
            "Run “Sync with Resend” on the Subscribers page and try again.", 409)

    eligible = eligible_recipient_count(db)
    if expected_recipients is not None and expected_recipients != eligible:
        raise CampaignError(
            f"The audience changed while you were reviewing ({expected_recipients} → {eligible} recipients). "
            "Review the send dialog again.", 409)

    if not _claim(db, campaign.id):
        raise CampaignError("This campaign is already being sent or has been sent.", 409)
    db.refresh(campaign)

    html = render_campaign_html(settings, campaign.content, campaign.preview_text)
    try:
        if campaign.resend_broadcast_id:
            # A previous attempt created a broadcast. Never create a second one before
            # knowing what happened to the first.
            remote = resend_client.get_broadcast(campaign.resend_broadcast_id)
            if _adopt_remote_status(campaign, remote):
                campaign.recipient_count = campaign.recipient_count or eligible
                db.commit()
                return campaign
            resend_client.delete_broadcast(campaign.resend_broadcast_id)
            campaign.resend_broadcast_id = None
            db.commit()

        campaign.html_content = html
        campaign.resend_broadcast_id = resend_client.create_broadcast(
            segment_id=settings.newsletter_segment_id,
            sender=newsletter_sender(settings),
            subject=campaign.subject,
            html=html,
            name=f"{campaign.title} (#{campaign.id})"[:200],
            reply_to=settings.ADMIN_EMAIL,
        )
        db.commit()  # persist the broadcast id before asking Resend to send it
        resend_client.send_broadcast(
            campaign.resend_broadcast_id,
            when.isoformat().replace("+00:00", "Z") if when else None,
        )
    except ResendError as exc:
        if exc.outcome_unknown and campaign.resend_broadcast_id:
            # Timeout / 5xx: the send may have gone through. Ask Resend before deciding.
            try:
                if _adopt_remote_status(campaign, resend_client.get_broadcast(campaign.resend_broadcast_id)):
                    campaign.recipient_count = eligible
                    campaign.scheduled_at = when
                    db.commit()
                    return campaign
            except ResendError:
                pass
        campaign.status = "failed"
        campaign.last_error = str(exc)[:1000]
        db.commit()
        logger.error("Campaign %s dispatch failed: %s", campaign.id, exc)
        raise CampaignError(f"Resend rejected the campaign: {exc.detail}", 502) from exc

    campaign.recipient_count = eligible
    if when:
        campaign.status = "scheduled"
        campaign.scheduled_at = when
    else:
        campaign.status = "sending"
        campaign.scheduled_at = None
        campaign.sent_at = utcnow()
    db.commit()
    logger.info("Campaign %s %s for %s recipient(s)", campaign.id, campaign.status, eligible)
    return campaign


def cancel(db: Session, campaign: NewsletterCampaign) -> NewsletterCampaign:
    """Cancel a scheduled campaign (Resend: deleting a scheduled broadcast cancels delivery)."""
    if campaign.status != "scheduled":
        raise CampaignError("Only scheduled campaigns can be cancelled.", 409)
    try:
        resend_client.delete_broadcast(campaign.resend_broadcast_id)
    except ResendError as exc:
        try:
            _adopt_remote_status(campaign, resend_client.get_broadcast(campaign.resend_broadcast_id))
            db.commit()
        except ResendError:
            pass
        raise CampaignError(f"Resend could not cancel the campaign: {exc.detail}", 502) from exc
    campaign.status = "cancelled"
    campaign.scheduled_at = None
    campaign.resend_broadcast_id = None
    db.commit()
    return campaign


def refresh_status(db: Session, campaign: NewsletterCampaign) -> NewsletterCampaign:
    """Pull the broadcast status from Resend for campaigns that are scheduled or sending."""
    if campaign.status not in ("scheduled", "sending") or not campaign.resend_broadcast_id:
        return campaign
    try:
        _adopt_remote_status(campaign, resend_client.get_broadcast(campaign.resend_broadcast_id))
        db.commit()
    except ResendError as exc:
        logger.warning("Could not refresh campaign %s from Resend: %s", campaign.id, exc)
    return campaign
