"""
Additive, idempotent schema patches (the project has no Alembic).

`Base.metadata.create_all()` creates missing tables but never alters existing ones,
so new columns on tables that already exist in production are added here. Rules:

- Only ADD COLUMN / CREATE INDEX IF NOT EXISTS. Nothing is ever dropped, renamed or deleted.
- Safe to run on every start: each step first checks what already exists.
- Works on PostgreSQL (Neon) and SQLite (tests / local).

Rollback: every change is a new nullable column or index, so the previous application
version keeps working against the patched schema. To undo manually:
    ALTER TABLE newsletter_subscribers DROP COLUMN <name>;
"""

import logging

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

# (column name, SQL type) — all nullable, no defaults, so adding them never rewrites
# or locks the table for long.
_SUBSCRIBER_COLUMNS = [
    ("first_name", "VARCHAR(120)"),
    ("status", "VARCHAR(20)"),
    ("consent_given", "BOOLEAN"),
    ("consent_timestamp", "TIMESTAMP WITH TIME ZONE"),
    ("consent_text", "VARCHAR(500)"),
    ("consent_ip", "VARCHAR(45)"),
    ("subscription_source", "VARCHAR(80)"),
    ("confirmation_token_hash", "VARCHAR(64)"),
    ("confirmation_expires_at", "TIMESTAMP WITH TIME ZONE"),
    ("confirmation_sent_at", "TIMESTAMP WITH TIME ZONE"),
    ("confirmed_at", "TIMESTAMP WITH TIME ZONE"),
    ("welcome_sent_at", "TIMESTAMP WITH TIME ZONE"),
    ("unsubscribed_at", "TIMESTAMP WITH TIME ZONE"),
    ("unsubscribe_source", "VARCHAR(40)"),
    ("resend_contact_id", "VARCHAR(64)"),
    ("resend_sync_pending", "BOOLEAN"),
    ("updated_at", "TIMESTAMP WITH TIME ZONE"),
]

_SUBSCRIBER_INDEXES = [
    ("ix_newsletter_subscribers_status", "status"),
    ("ix_newsletter_subscribers_confirmation_token_hash", "confirmation_token_hash"),
    ("ix_newsletter_subscribers_resend_contact_id", "resend_contact_id"),
]


def run_migrations(engine: Engine) -> None:
    insp = inspect(engine)
    if "newsletter_subscribers" not in insp.get_table_names():
        return  # create_all() has not run yet; it will create the full table

    existing = {c["name"] for c in insp.get_columns("newsletter_subscribers")}
    is_sqlite = engine.dialect.name == "sqlite"

    with engine.begin() as conn:  # one transaction: all patches apply or none do
        for name, sql_type in _SUBSCRIBER_COLUMNS:
            if name in existing:
                continue
            if is_sqlite:
                sql_type = sql_type.replace(" WITH TIME ZONE", "")
            conn.execute(text(f"ALTER TABLE newsletter_subscribers ADD COLUMN {name} {sql_type}"))
            logger.info("Schema patch: newsletter_subscribers.%s added", name)

        for index_name, column in _SUBSCRIBER_INDEXES:
            conn.execute(text(
                f"CREATE INDEX IF NOT EXISTS {index_name} ON newsletter_subscribers ({column})"
            ))

        # Rows that existed before consent tracking: keep them, but never treat them as
        # marketing-consented. They stay "pending" until the person confirms.
        result = conn.execute(text(
            "UPDATE newsletter_subscribers "
            "SET status = 'pending', consent_given = :no, subscription_source = 'legacy', "
            "    resend_sync_pending = :no "
            "WHERE status IS NULL"
        ), {"no": False})
        if result.rowcount:
            logger.info("Schema patch: %s legacy subscriber(s) marked pending (no recorded consent)",
                        result.rowcount)
