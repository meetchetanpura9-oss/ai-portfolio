from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    LargeBinary,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB

from app.database.connection import Base

# JSONB on PostgreSQL (Neon), plain JSON on SQLite (tests / local).
JsonType = JSON().with_variant(JSONB(), "postgresql")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


SUBSCRIBER_STATUSES = ("pending", "active", "unsubscribed", "suppressed")
CAMPAIGN_STATUSES = ("draft", "scheduled", "sending", "sent", "failed", "cancelled")
CASE_STUDY_STATUSES = ("draft", "published")
CASE_STUDY_CATEGORIES = (
    "Agentic AI",
    "Generative AI",
    "Machine Learning",
    "Deep Learning",
    "Data Analytics",
    "Workflow Automation",
    "Backend Engineering",
    "Full-Stack Development",
)


class NewsletterSubscriber(Base):
    """
    One row per email address.

    status:
      pending       signed up (or a legacy row) but has not confirmed — never emailed campaigns
      active        confirmed, receives campaigns
      unsubscribed  opted out (by link, Resend, or an admin)
      suppressed    hard bounce / spam complaint / admin block — never emailed again
    """

    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    # Original column, kept as the signup date ("created_at").
    subscribed_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    first_name = Column(String(120))
    status = Column(String(20), default="pending", index=True)
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime(timezone=True))
    consent_text = Column(String(500))
    consent_ip = Column(String(45))
    subscription_source = Column(String(80))
    confirmation_token_hash = Column(String(64), index=True)
    confirmation_expires_at = Column(DateTime(timezone=True))
    confirmation_sent_at = Column(DateTime(timezone=True))
    confirmed_at = Column(DateTime(timezone=True))
    welcome_sent_at = Column(DateTime(timezone=True))
    unsubscribed_at = Column(DateTime(timezone=True))
    # link | one_click | resend | admin | bounced | complained
    unsubscribe_source = Column(String(40))
    resend_contact_id = Column(String(64), index=True)
    # True when the Resend contact is out of date and must be pushed before a send.
    resend_sync_pending = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class NewsletterCampaign(Base):
    __tablename__ = "newsletter_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    subject = Column(String(200), nullable=False, default="")
    preview_text = Column(String(200))
    content = Column(Text, nullable=False, default="")  # Markdown written by the admin
    html_content = Column(Text, nullable=False, default="")  # rendered server-side, never user HTML
    status = Column(String(20), nullable=False, default="draft", index=True)
    resend_broadcast_id = Column(String(64), index=True)
    recipient_count = Column(Integer)
    scheduled_at = Column(DateTime(timezone=True))
    sent_at = Column(DateTime(timezone=True))
    last_error = Column(Text)
    case_study_id = Column(Integer, ForeignKey("case_studies.id", ondelete="SET NULL"), index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class CaseStudy(Base):
    __tablename__ = "case_studies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(220), nullable=False, unique=True, index=True)
    summary = Column(Text, default="")
    category = Column(String(60), index=True)
    cover_image_url = Column(String(500))
    # Long-form sections (Markdown)
    problem_statement = Column(Text, default="")
    project_overview = Column(Text, default="")
    solution = Column(Text, default="")
    technical_architecture = Column(Text, default="")
    implementation = Column(Text, default="")
    results = Column(Text, default="")
    challenges = Column(Text, default="")
    lessons_learned = Column(Text, default="")
    # Structured content
    architecture_steps = Column(JsonType, default=list)  # ["Client", "API", ...]
    technologies = Column(JsonType, default=list)  # ["Python", ...]
    key_features = Column(JsonType, default=list)  # ["...", ...]
    screenshots = Column(JsonType, default=list)  # [{"src": "...", "alt": "..."}]
    github_url = Column(String(500))
    live_demo_url = Column(String(500))
    seo_title = Column(String(200))
    seo_description = Column(String(320))
    status = Column(String(20), nullable=False, default="draft", index=True)
    featured = Column(Boolean, nullable=False, default=False)
    published_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    __table_args__ = (Index("ix_case_studies_status_published", "status", "published_at"),)


class NewsletterWebhookEvent(Base):
    """One row per Resend webhook delivery; the unique svix_id makes processing idempotent."""

    __tablename__ = "newsletter_webhook_events"

    id = Column(Integer, primary_key=True)
    svix_id = Column(String(120), nullable=False, unique=True, index=True)
    event_type = Column(String(60), nullable=False, index=True)
    received_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class NewsletterEmailEvent(Base):
    """Delivery events for campaign emails, as reported by Resend webhooks."""

    __tablename__ = "newsletter_email_events"

    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, ForeignKey("newsletter_campaigns.id", ondelete="SET NULL"), index=True)
    subscriber_id = Column(Integer, ForeignKey("newsletter_subscribers.id", ondelete="SET NULL"), index=True)
    resend_broadcast_id = Column(String(64), index=True)
    resend_email_id = Column(String(64), nullable=False)
    event_type = Column(String(40), nullable=False)  # sent, delivered, bounced, complained, opened, clicked, ...
    occurred_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    svix_id = Column(String(120), nullable=False, unique=True)

    __table_args__ = (Index("ix_newsletter_email_events_campaign_type", "campaign_id", "event_type"),)


class MediaAsset(Base):
    """Small images uploaded from the admin (covers, screenshots). Stored in Postgres."""

    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True)
    public_id = Column(String(40), nullable=False, unique=True, index=True)
    filename = Column(String(200), nullable=False)
    content_type = Column(String(60), nullable=False)
    size = Column(Integer, nullable=False)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
