"""
Startup migration against a REAL PostgreSQL server (production runs on Neon PostgreSQL;
the rest of the suite uses SQLite).

Recreates the newsletter_subscribers table exactly as it exists in production before this
change (id, email, subscribed_at), inserts legacy rows, then runs the same steps the app
runs on startup — Base.metadata.create_all() followed by run_migrations() — twice.

Needs TEST_POSTGRES_URL pointing at a throwaway database (CI provides one). Never point it
at production. Without it the test is skipped locally, but it FAILS on CI, so the CI run
can never pass without actually exercising PostgreSQL.
"""

import os
import uuid

import pytest
from sqlalchemy import create_engine, inspect, text

# Isolated app settings (SQLite app DB, stubbed providers) — must be imported first.
import test_health_and_routes  # noqa: F401

from app.database.connection import Base, normalize_database_url
from app.database.migrations import run_migrations
import app.models.newsletter_model  # noqa: F401 — registers the newsletter tables on Base

PG_URL = os.getenv("TEST_POSTGRES_URL", "").strip()

if not PG_URL:
    if os.getenv("CI"):
        pytest.fail("TEST_POSTGRES_URL must be set on CI", pytrace=False)
    pytest.skip("TEST_POSTGRES_URL not set (local run)", allow_module_level=True)


@pytest.fixture
def pg_engine():
    schema = f"mig_{uuid.uuid4().hex[:10]}"
    admin = create_engine(normalize_database_url(PG_URL))
    with admin.begin() as conn:
        conn.execute(text(f'CREATE SCHEMA "{schema}"'))
    engine = create_engine(normalize_database_url(PG_URL),
                           connect_args={"options": f"-csearch_path={schema}"})
    try:
        yield engine
    finally:
        engine.dispose()
        with admin.begin() as conn:
            conn.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        admin.dispose()


def _create_production_schema(engine):
    """newsletter_subscribers as created by the current production model (main branch)."""
    with engine.begin() as conn:
        conn.execute(text(
            "CREATE TABLE newsletter_subscribers ("
            " id SERIAL PRIMARY KEY,"
            " email VARCHAR(255) NOT NULL,"
            " subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL)"
        ))
        conn.execute(text("CREATE INDEX ix_newsletter_subscribers_id ON newsletter_subscribers (id)"))
        conn.execute(text("CREATE UNIQUE INDEX ix_newsletter_subscribers_email ON newsletter_subscribers (email)"))
        conn.execute(text(
            "INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES "
            "('legacy1@example.org', '2026-01-05 10:00:00+00'),"
            "('legacy2@example.org', '2026-03-09 18:30:00+00')"
        ))


def test_startup_migration_on_postgres_preserves_and_never_consents_legacy_rows(pg_engine):
    _create_production_schema(pg_engine)

    for _ in range(2):  # app restarts: must be idempotent
        Base.metadata.create_all(bind=pg_engine)
        run_migrations(pg_engine)

    insp = inspect(pg_engine)
    tables = set(insp.get_table_names())
    assert {"newsletter_subscribers", "newsletter_campaigns", "case_studies",
            "newsletter_email_events", "newsletter_webhook_events", "media_assets"} <= tables

    cols = {c["name"]: c for c in insp.get_columns("newsletter_subscribers")}
    expected = {"status", "consent_given", "consent_timestamp", "subscription_source",
                "confirmation_token_hash", "confirmation_expires_at", "confirmed_at",
                "welcome_sent_at", "unsubscribed_at", "unsubscribe_source",
                "resend_contact_id", "resend_sync_pending", "updated_at", "first_name"}
    assert expected <= set(cols)
    assert all(cols[name]["nullable"] for name in expected)  # additive, nullable only

    index_names = {i["name"] for i in insp.get_indexes("newsletter_subscribers")}
    assert {"ix_newsletter_subscribers_status",
            "ix_newsletter_subscribers_confirmation_token_hash",
            "ix_newsletter_subscribers_email"} <= index_names

    with pg_engine.connect() as conn:
        rows = conn.execute(text(
            "SELECT email, subscribed_at, status, consent_given, subscription_source, "
            "confirmed_at, resend_contact_id FROM newsletter_subscribers ORDER BY id"
        )).all()
    assert [r.email for r in rows] == ["legacy1@example.org", "legacy2@example.org"]
    assert rows[0].subscribed_at.isoformat().startswith("2026-01-05T10:00:00")  # untouched
    for r in rows:
        assert r.status == "pending"          # never treated as active
        assert r.consent_given is False       # consent not assumed
        assert r.subscription_source == "legacy"
        assert r.confirmed_at is None and r.resend_contact_id is None


def test_new_rows_work_after_migration_on_postgres(pg_engine):
    _create_production_schema(pg_engine)
    Base.metadata.create_all(bind=pg_engine)
    run_migrations(pg_engine)

    with pg_engine.begin() as conn:
        conn.execute(text(
            "INSERT INTO newsletter_subscribers (email, subscribed_at, status, consent_given) "
            "VALUES ('new@example.org', now(), 'active', true)"
        ))
        # Unique email constraint from the production schema still holds.
        with pytest.raises(Exception):
            with conn.begin_nested():
                conn.execute(text(
                    "INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES ('new@example.org', now())"
                ))
    # A second migration run must not touch rows that already have a status.
    run_migrations(pg_engine)
    with pg_engine.connect() as conn:
        status = conn.execute(text(
            "SELECT status FROM newsletter_subscribers WHERE email = 'new@example.org'")).scalar()
    assert status == "active"
