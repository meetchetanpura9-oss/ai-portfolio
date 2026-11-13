"""
Admin newsletter API: subscribers, campaigns and email analytics.

Every route requires a valid JWT *and* the admin role (router-level dependency), so
authorization never depends on what the frontend chooses to show.
"""

import csv
import io
import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.db import get_db
from app.models.newsletter_model import (
    CaseStudy,
    NewsletterCampaign,
    NewsletterEmailEvent,
    NewsletterSubscriber,
    NewsletterWebhookEvent,
)
from app.schemas.newsletter_schema import (
    CampaignPreview,
    CampaignSchedule,
    CampaignSend,
    CampaignWrite,
    SubscriberUpdate,
)
from app.services import campaign_service as campaigns
from app.services import newsletter_service as svc
from app.services.auth_service import require_admin
from app.services.campaign_service import CampaignError
from app.services.email_delivery import _resend_sender

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/newsletter", tags=["Admin · Newsletter"], dependencies=[Depends(require_admin)])


# ===================================================================================
# Overview / settings
# ===================================================================================
def _status_counts(db: Session) -> dict:
    rows = db.query(NewsletterSubscriber.status, func.count(NewsletterSubscriber.id)).group_by(
        NewsletterSubscriber.status).all()
    counts = {"pending": 0, "active": 0, "unsubscribed": 0, "suppressed": 0}
    for name, count in rows:
        counts[name or "pending"] = counts.get(name or "pending", 0) + count
    counts["total"] = sum(counts.values())
    return counts


@router.get("/overview", summary="KPI counts for the dashboard (live database values)")
def overview(db: Session = Depends(get_db)):
    campaign_rows = dict(
        db.query(NewsletterCampaign.status, func.count(NewsletterCampaign.id))
        .group_by(NewsletterCampaign.status).all()
    )
    return {
        "subscribers": _status_counts(db),
        "campaigns": {
            "total": sum(campaign_rows.values()),
            "sent": campaign_rows.get("sent", 0) + campaign_rows.get("sending", 0),
            "scheduled": campaign_rows.get("scheduled", 0),
            "draft": campaign_rows.get("draft", 0),
        },
        "case_studies": {
            "published": db.query(func.count(CaseStudy.id)).filter(CaseStudy.status == "published").scalar() or 0,
            "draft": db.query(func.count(CaseStudy.id)).filter(CaseStudy.status == "draft").scalar() or 0,
        },
    }


@router.get("/settings", summary="Newsletter configuration status (never returns secrets)")
def newsletter_settings(db: Session = Depends(get_db)):
    settings = get_settings()
    last_webhook = db.query(func.max(NewsletterWebhookEvent.received_at)).scalar()
    return {
        "resend_configured": settings.resend_enabled,
        "sender": f"{settings.NEWSLETTER_FROM_NAME} <{_resend_sender(settings)}>" if settings.resend_enabled else None,
        "admin_email": settings.ADMIN_EMAIL,
        "segment_configured": bool(settings.newsletter_segment_id),
        "webhook_secret_configured": bool(settings.RESEND_WEBHOOK_SECRET.strip()),
        "last_webhook_at": last_webhook,
        "double_opt_in": settings.NEWSLETTER_DOUBLE_OPT_IN,
        "confirmation_hours": settings.NEWSLETTER_CONFIRMATION_HOURS,
        "app_base_url": settings.app_base_url,
        "dedicated_signing_secret": bool(settings.NEWSLETTER_CONFIRMATION_SECRET.strip()),
        "postal_address_configured": bool(settings.NEWSLETTER_POSTAL_ADDRESS.strip()),
        "pending_sync": campaigns.pending_sync_count(db),
    }


# ===================================================================================
# Subscribers
# ===================================================================================
def _subscriber_row(s: NewsletterSubscriber) -> dict:
    return {
        "id": s.id,
        "email": s.email,
        "first_name": s.first_name,
        "status": s.status or "pending",
        "consent_given": bool(s.consent_given),
        "consent_timestamp": s.consent_timestamp,
        "subscription_source": s.subscription_source,
        "created_at": s.subscribed_at,
        "confirmed_at": s.confirmed_at,
        "unsubscribed_at": s.unsubscribed_at,
        "unsubscribe_source": s.unsubscribe_source,
    }


def _subscriber_query(db: Session, search: str | None, status_filter: str | None):
    query = db.query(NewsletterSubscriber)
    if search and search.strip():
        # Escape LIKE wildcards so "%" in the search box is literal.
        term = search.strip().lower().replace("\\", "\\\\").replace("%", r"\%").replace("_", r"\_")
        query = query.filter(NewsletterSubscriber.email.ilike(f"%{term}%", escape="\\"))
    if status_filter:
        query = query.filter(NewsletterSubscriber.status == status_filter)
    return query


@router.get("/subscribers", summary="List subscribers (paginated)")
def list_subscribers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=255),
    status_filter: str | None = Query(None, alias="status", pattern="^(pending|active|unsubscribed|suppressed)$"),
    sort: str = Query("newest", pattern="^(newest|oldest)$"),
    db: Session = Depends(get_db),
):
    query = _subscriber_query(db, search, status_filter)
    total = query.count()
    order = NewsletterSubscriber.subscribed_at.asc() if sort == "oldest" else NewsletterSubscriber.subscribed_at.desc()
    rows = query.order_by(order, NewsletterSubscriber.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [_subscriber_row(s) for s in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
        "counts": _status_counts(db),
    }


def _csv_safe(value) -> str:
    """Neutralise spreadsheet formula injection (cells starting with = + - @)."""
    text = "" if value is None else str(value)
    return "'" + text if text[:1] in ("=", "+", "-", "@", "\t", "\r") else text


@router.get("/subscribers/export", summary="Download subscribers as CSV")
def export_subscribers(
    search: str | None = Query(None, max_length=255),
    status_filter: str | None = Query(None, alias="status", pattern="^(pending|active|unsubscribed|suppressed)$"),
    db: Session = Depends(get_db),
):
    query = _subscriber_query(db, search, status_filter).order_by(NewsletterSubscriber.id)

    def rows():
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["id", "email", "first_name", "status", "consent_given", "consent_timestamp",
                         "subscription_source", "signed_up_at", "confirmed_at", "unsubscribed_at",
                         "unsubscribe_source"])
        yield "﻿" + buffer.getvalue()  # BOM so Excel reads UTF-8
        # Stream in chunks: the whole list is never held in memory.
        for s in query.yield_per(500):
            buffer.seek(0)
            buffer.truncate(0)
            writer.writerow([
                s.id, _csv_safe(s.email), _csv_safe(s.first_name), s.status or "pending",
                "yes" if s.consent_given else "no",
                s.consent_timestamp.isoformat() if s.consent_timestamp else "",
                _csv_safe(s.subscription_source),
                s.subscribed_at.isoformat() if s.subscribed_at else "",
                s.confirmed_at.isoformat() if s.confirmed_at else "",
                s.unsubscribed_at.isoformat() if s.unsubscribed_at else "",
                s.unsubscribe_source or "",
            ])
            yield buffer.getvalue()

    filename = f"newsletter_subscribers_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(rows(), media_type="text/csv; charset=utf-8", headers={
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Access-Control-Expose-Headers": "Content-Disposition",
    })


@router.post("/subscribers/sync", summary="Push outstanding subscriber changes to Resend")
def sync_subscribers(db: Session = Depends(get_db)):
    settings = get_settings()
    if not settings.resend_enabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "RESEND_API_KEY is not configured on the server.")
    before = campaigns.pending_sync_count(db)
    remaining = campaigns.flush_pending_syncs(db, settings)
    return {"synced": max(before - remaining, 0), "remaining": remaining}


def _get_subscriber(db: Session, subscriber_id: int) -> NewsletterSubscriber:
    subscriber = db.get(NewsletterSubscriber, subscriber_id)
    if subscriber is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Subscriber not found")
    return subscriber


@router.get("/subscribers/{subscriber_id}", summary="Subscriber details")
def get_subscriber(subscriber_id: int, db: Session = Depends(get_db)):
    s = _get_subscriber(db, subscriber_id)
    events = (
        db.query(NewsletterEmailEvent.event_type, NewsletterEmailEvent.occurred_at, NewsletterCampaign.title)
        .outerjoin(NewsletterCampaign, NewsletterCampaign.id == NewsletterEmailEvent.campaign_id)
        .filter(NewsletterEmailEvent.subscriber_id == s.id)
        .order_by(NewsletterEmailEvent.occurred_at.desc())
        .limit(25)
        .all()
    )
    return {
        **_subscriber_row(s),
        "consent_text": s.consent_text,
        "consent_ip": s.consent_ip,
        "confirmation_sent_at": s.confirmation_sent_at,
        "confirmation_expires_at": s.confirmation_expires_at,
        "welcome_sent_at": s.welcome_sent_at,
        "in_resend": bool(s.resend_contact_id),
        "resend_sync_pending": bool(s.resend_sync_pending),
        "updated_at": s.updated_at,
        "recent_events": [
            {"event_type": e.event_type, "occurred_at": e.occurred_at, "campaign": e.title} for e in events
        ],
    }


@router.patch("/subscribers/{subscriber_id}", summary="Unsubscribe, suppress, or re-send confirmation")
def update_subscriber(
    subscriber_id: int,
    payload: SubscriberUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Admins can only move a subscriber *away* from receiving email. Nobody can be made
    active from here: that takes the subscriber's own confirmation.
    """
    s = _get_subscriber(db, subscriber_id)
    settings = get_settings()

    if payload.action == "resend_confirmation":
        if s.status != "pending":
            raise HTTPException(status.HTTP_409_CONFLICT, "Only pending subscribers can be sent a confirmation email.")
        if not settings.resend_enabled:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "RESEND_API_KEY is not configured on the server.")
        token, token_hash = svc.new_confirmation_token()
        now = svc.utcnow()
        s.confirmation_token_hash = token_hash
        s.confirmation_expires_at = now + timedelta(hours=settings.NEWSLETTER_CONFIRMATION_HOURS)
        s.confirmation_sent_at = now
        db.commit()
        background_tasks.add_task(svc.deliver_confirmation_email, s.id, token)
        return {"status": s.status, "message": "Confirmation email queued."}

    if payload.action == "suppress":
        changed = svc.unsubscribe(db, s, source="admin", status="suppressed")
    else:
        changed = svc.unsubscribe(db, s, source="admin")
    if changed:
        background_tasks.add_task(svc.push_unsubscribe, s.id)
    return {"status": s.status, "changed": changed}


# ===================================================================================
# Campaigns
# ===================================================================================
def _campaign_row(c: NewsletterCampaign, full: bool = False) -> dict:
    data = {
        "id": c.id,
        "title": c.title,
        "subject": c.subject,
        "preview_text": c.preview_text,
        "status": c.status,
        "recipient_count": c.recipient_count,
        "scheduled_at": c.scheduled_at,
        "sent_at": c.sent_at,
        "case_study_id": c.case_study_id,
        "last_error": c.last_error,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
    }
    if full:
        data["content"] = c.content
        data["editable"] = c.status in campaigns.EDITABLE_STATUSES
    return data


def _get_campaign(db: Session, campaign_id: int) -> NewsletterCampaign:
    campaign = db.get(NewsletterCampaign, campaign_id)
    if campaign is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Campaign not found")
    return campaign


def _fail(exc: CampaignError):
    raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.get("/campaigns", summary="List campaigns (paginated)")
def list_campaigns(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status", pattern="^(draft|scheduled|sending|sent|failed|cancelled)$"),
    db: Session = Depends(get_db),
):
    query = db.query(NewsletterCampaign)
    if status_filter:
        query = query.filter(NewsletterCampaign.status == status_filter)
    total = query.count()
    rows = (query.order_by(NewsletterCampaign.updated_at.desc(), NewsletterCampaign.id.desc())
            .offset((page - 1) * page_size).limit(page_size).all())
    return {"items": [_campaign_row(c) for c in rows], "total": total, "page": page, "page_size": page_size}


@router.post("/campaigns", status_code=status.HTTP_201_CREATED, summary="Create a draft campaign")
def create_campaign(payload: CampaignWrite, db: Session = Depends(get_db)):
    settings = get_settings()
    campaign = NewsletterCampaign(
        title=payload.title,
        subject=payload.subject,
        preview_text=payload.preview_text,
        content=payload.content,
        html_content=campaigns.render_campaign_html(settings, payload.content, payload.preview_text),
        status="draft",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return _campaign_row(campaign, full=True)


@router.post("/campaigns/preview", summary="Render unsaved content as the final email HTML")
def preview_content(payload: CampaignPreview):
    return {"html": campaigns.render_campaign_html(get_settings(), payload.content, payload.preview_text)}


@router.get("/campaigns/{campaign_id}", summary="Campaign details")
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    return _campaign_row(_get_campaign(db, campaign_id), full=True)


@router.put("/campaigns/{campaign_id}", summary="Edit a draft campaign")
def update_campaign(campaign_id: int, payload: CampaignWrite, db: Session = Depends(get_db)):
    campaign = _get_campaign(db, campaign_id)
    if campaign.status not in campaigns.EDITABLE_STATUSES:
        raise HTTPException(status.HTTP_409_CONFLICT,
                            f"A {campaign.status} campaign cannot be edited. Duplicate it to make changes.")
    settings = get_settings()
    campaign.title = payload.title
    campaign.subject = payload.subject
    campaign.preview_text = payload.preview_text
    campaign.content = payload.content
    campaign.html_content = campaigns.render_campaign_html(settings, payload.content, payload.preview_text)
    db.commit()
    db.refresh(campaign)
    return _campaign_row(campaign, full=True)


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a draft")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = _get_campaign(db, campaign_id)
    if campaign.status not in ("draft", "failed", "cancelled"):
        raise HTTPException(status.HTTP_409_CONFLICT,
                            "Only draft, failed or cancelled campaigns can be deleted. Sent campaigns are kept as a record.")
    if campaign.resend_broadcast_id:
        raise HTTPException(status.HTTP_409_CONFLICT,
                            "This campaign has a broadcast in Resend from a failed attempt. Retry the send or check Resend first.")
    db.delete(campaign)
    db.commit()
    return None


@router.post("/campaigns/{campaign_id}/duplicate", status_code=status.HTTP_201_CREATED,
             summary="Copy a campaign into a new draft")
def duplicate_campaign(campaign_id: int, db: Session = Depends(get_db)):
    source = _get_campaign(db, campaign_id)
    copy = NewsletterCampaign(
        title=f"{source.title} (copy)"[:200], subject=source.subject, preview_text=source.preview_text,
        content=source.content, html_content=source.html_content, status="draft",
        case_study_id=source.case_study_id,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return _campaign_row(copy, full=True)


@router.post("/campaigns/{campaign_id}/preview", summary="Final email HTML + pre-send checks")
def preview_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = _get_campaign(db, campaign_id)
    settings = get_settings()
    return {
        "subject": campaign.subject,
        "html": campaigns.render_campaign_html(settings, campaign.content, campaign.preview_text),
        **campaigns.send_readiness(db, settings, campaign),
    }


@router.post("/campaigns/{campaign_id}/test", summary="Send a test to ADMIN_EMAIL only")
def test_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = _get_campaign(db, campaign_id)
    settings = get_settings()
    try:
        campaigns.send_test(settings, campaign)
    except CampaignError as exc:
        _fail(exc)
    return {"sent": True, "to": settings.ADMIN_EMAIL}


@router.post("/campaigns/{campaign_id}/send", summary="Send now (requires explicit confirmation)")
def send_campaign(campaign_id: int, payload: CampaignSend, db: Session = Depends(get_db)):
    if not payload.confirm:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            "Sending requires explicit confirmation (confirm: true).")
    campaign = _get_campaign(db, campaign_id)
    try:
        campaigns.dispatch(db, get_settings(), campaign, expected_recipients=payload.expected_recipients)
    except CampaignError as exc:
        _fail(exc)
    return _campaign_row(campaign, full=True)


@router.post("/campaigns/{campaign_id}/schedule", summary="Schedule (requires explicit confirmation)")
def schedule_campaign(campaign_id: int, payload: CampaignSchedule, db: Session = Depends(get_db)):
    if not payload.confirm:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            "Scheduling requires explicit confirmation (confirm: true).")
    campaign = _get_campaign(db, campaign_id)
    try:
        campaigns.dispatch(db, get_settings(), campaign, expected_recipients=payload.expected_recipients,
                           scheduled_at=payload.scheduled_at)
    except CampaignError as exc:
        _fail(exc)
    return _campaign_row(campaign, full=True)


@router.post("/campaigns/{campaign_id}/cancel", summary="Cancel a scheduled campaign")
def cancel_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = _get_campaign(db, campaign_id)
    try:
        campaigns.cancel(db, campaign)
    except CampaignError as exc:
        _fail(exc)
    return _campaign_row(campaign, full=True)


@router.post("/campaigns/{campaign_id}/refresh", summary="Refresh delivery status from Resend")
def refresh_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = campaigns.refresh_status(db, _get_campaign(db, campaign_id))
    return _campaign_row(campaign, full=True)


# ===================================================================================
# Analytics
# ===================================================================================
_TRACKED = ("sent", "delivered", "bounced", "complained", "opened", "clicked")


def _rate(part: int | None, whole: int | None) -> float | None:
    if part is None or not whole:
        return None
    return round(part / whole * 100, 1)


@router.get("/analytics", summary="Campaign delivery metrics from Resend webhook events")
def analytics(limit: int = Query(25, ge=1, le=100), db: Session = Depends(get_db)):
    """
    Numbers come only from events Resend reported through the webhook. A campaign with no
    events yet shows nulls ("not available"), never zeros dressed up as results. Counts
    are unique emails per event type. The API accepting a send is not counted as delivery.
    """
    settings = get_settings()
    sent_campaigns = (
        db.query(NewsletterCampaign)
        .filter(NewsletterCampaign.status.in_(("sent", "sending", "scheduled")))
        .order_by(func.coalesce(NewsletterCampaign.sent_at, NewsletterCampaign.scheduled_at).desc())
        .limit(limit)
        .all()
    )
    ids = [c.id for c in sent_campaigns]
    counts: dict[int, dict[str, int]] = {}
    if ids:
        rows = (
            db.query(NewsletterEmailEvent.campaign_id, NewsletterEmailEvent.event_type,
                     func.count(func.distinct(NewsletterEmailEvent.resend_email_id)))
            .filter(NewsletterEmailEvent.campaign_id.in_(ids))
            .group_by(NewsletterEmailEvent.campaign_id, NewsletterEmailEvent.event_type)
            .all()
        )
        for campaign_id, event_type, count in rows:
            counts.setdefault(campaign_id, {})[event_type] = count

    items = []
    totals = {key: 0 for key in _TRACKED}
    totals["recipients"] = 0
    any_events = False
    for c in sent_campaigns:
        events = counts.get(c.id)
        has_events = bool(events)
        any_events = any_events or has_events
        metrics = {key: (events.get(key, 0) if has_events else None) for key in _TRACKED}
        if c.status != "scheduled":
            totals["recipients"] += c.recipient_count or 0
        if has_events:
            for key in _TRACKED:
                totals[key] += metrics[key]
        items.append({
            "id": c.id,
            "title": c.title,
            "subject": c.subject,
            "status": c.status,
            "sent_at": c.sent_at,
            "scheduled_at": c.scheduled_at,
            "recipients": c.recipient_count,
            "tracking_available": has_events,
            **metrics,
            # Resend reports unsubscribes per contact, not per broadcast.
            "unsubscribes": None,
            "delivery_rate": _rate(metrics["delivered"], metrics["sent"]),
            "open_rate": _rate(metrics["opened"], metrics["delivered"]),
            "click_rate": _rate(metrics["clicked"], metrics["delivered"]),
        })

    unsubscribes_total = (
        db.query(func.count(NewsletterSubscriber.id))
        .filter(NewsletterSubscriber.status == "unsubscribed").scalar() or 0
    )
    return {
        "webhook_configured": bool(settings.RESEND_WEBHOOK_SECRET.strip()),
        "last_webhook_at": db.query(func.max(NewsletterWebhookEvent.received_at)).scalar(),
        "totals": {
            **({key: totals[key] for key in _TRACKED} if any_events else {key: None for key in _TRACKED}),
            "recipients": totals["recipients"],
            "unsubscribes": unsubscribes_total,
            "delivery_rate": _rate(totals["delivered"], totals["sent"]) if any_events else None,
            "click_rate": _rate(totals["clicked"], totals["delivered"]) if any_events else None,
        },
        "campaigns": items,
    }
