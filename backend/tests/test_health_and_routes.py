"""
Health-check and regression tests.

Runs against a throwaway SQLite file — never the production database — and
stubs every outbound side effect (email, WhatsApp, IP geolocation).

Run from the backend folder:  python -m pytest tests -q
"""

import os
import tempfile

_TMP_DB = os.path.join(tempfile.mkdtemp(), "test.db")
# Must be set before the app is imported (settings are cached at import time).
os.environ.update(
    DATABASE_URL=f"sqlite:///{_TMP_DB}",
    # Explicit test-only secrets (production refuses to start without real ones).
    APP_ENV="test",
    JWT_SECRET="test-only-jwt-secret-0123456789abcdef",
    NEWSLETTER_CONFIRMATION_SECRET="test-only-newsletter-secret-0123456789abcdef",
    ADMIN_EMAIL="admin-test@example.org",
    ADMIN_NAME="Test Admin",
    ADMIN_PASSWORD="test-admin-password-123",
    RESEND_API_KEY="",
    MAIL_SERVER="",
    MAIL_USERNAME="",
    MAIL_PASSWORD="",
    CALLMEBOT_PHONE="",
    CALLMEBOT_APIKEY="",
    TWILIO_ACCOUNT_SID="",
    TWILIO_AUTH_TOKEN="",
)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.exc import OperationalError  # noqa: E402

import app.database.connection as connection  # noqa: E402
import app.main as main  # noqa: E402
import app.routes.analytics_routes as analytics_routes  # noqa: E402
import app.routes.contact_routes as contact_routes  # noqa: E402

FAKE_SECRET = "SuperSecretPw!"
FAKE_DSN = f"postgresql://neon_user:{FAKE_SECRET}@ep-fake-123.neon.tech/neondb?sslmode=require"


@pytest.fixture
def client(monkeypatch):
    noop = lambda *a, **k: None  # noqa: E731
    for name in ("deliver_contact_emails", "notify_unsaved_contact",
                 "deliver_whatsapp_alert", "resolve_contact_country"):
        monkeypatch.setattr(contact_routes, name, noop, raising=False)
    monkeypatch.setattr(analytics_routes, "resolve_ip_country", noop, raising=False)
    return TestClient(main.app)


def _login(client):
    r = client.post("/auth/login", json={
        "email": os.environ["ADMIN_EMAIL"], "password": os.environ["ADMIN_PASSWORD"],
    })
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


# --- Test A ---------------------------------------------------------------
def test_health_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# --- Test B ---------------------------------------------------------------
def test_health_db_connected(client):
    r = client.get("/health/db")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "database": "connected"}


# --- Test C ---------------------------------------------------------------
def test_health_db_unavailable_returns_safe_503(client, monkeypatch, caplog):
    def boom(*a, **k):
        raise OperationalError("SELECT 1", {}, Exception(f"connection to {FAKE_DSN} failed"))

    monkeypatch.setattr(connection.engine, "connect", boom)
    r = client.get("/health/db")
    assert r.status_code == 503
    assert r.json() == {
        "status": "error",
        "database": "disconnected",
        "message": "Database temporarily unavailable",
    }
    assert FAKE_SECRET not in r.text and "neon.tech" not in r.text
    assert "Database health check failed" in caplog.text  # logged internally
    # App is still alive and recovers once the DB is back.
    monkeypatch.undo()
    assert client.get("/health").status_code == 200
    assert client.get("/health/db").status_code == 200


# --- Driver / URL handling -------------------------------------------------
@pytest.mark.parametrize("raw", [
    FAKE_DSN,
    FAKE_DSN.replace("postgresql://", "postgres://"),
    FAKE_DSN.replace("postgresql://", "postgresql+psycopg2://"),
    f'"{FAKE_DSN}"',
])
def test_neon_urls_use_psycopg3_and_keep_ssl(raw):
    url = connection.normalize_database_url(raw)
    assert url.startswith("postgresql+psycopg://")
    assert url.endswith("?sslmode=require")
    eng = create_engine(url)  # no connection is opened
    assert eng.dialect.driver == "psycopg"


def test_redact_url_hides_password():
    assert FAKE_SECRET not in connection.redact_url(FAKE_DSN)


# --- Admin seeding --------------------------------------------------------
def test_admin_seed_requires_password_and_never_logs_it(monkeypatch, caplog):
    from app.database.connection import SessionLocal
    from app.models.user_model import User

    db = SessionLocal()
    try:
        before = db.query(User).count()
    finally:
        db.close()
    # Users exist -> re-running init must not create or reset anyone.
    assert main.init_database() is True
    db = SessionLocal()
    try:
        assert db.query(User).count() == before == 1
    finally:
        db.close()
    assert os.environ["ADMIN_PASSWORD"] not in caplog.text

    # No ADMIN_PASSWORD -> no account is created from a hardcoded default.
    db = SessionLocal()
    db.query(User).delete()
    db.commit()
    db.close()
    monkeypatch.setattr(main.settings, "ADMIN_PASSWORD", "")
    assert main.init_database() is True
    db = SessionLocal()
    try:
        assert db.query(User).count() == 0
    finally:
        db.close()
    assert "skipping initial admin creation" in caplog.text
    monkeypatch.undo()
    assert main.init_database() is True  # restore the admin for other tests


# --- Test D: existing functionality ----------------------------------------
def test_admin_auth(client):
    bad = client.post("/auth/login", json={"email": os.environ["ADMIN_EMAIL"], "password": "wrong-pass"})
    assert bad.status_code == 401
    assert client.get("/admin/contacts").status_code == 401
    _login(client)


def test_contact_and_contact_management(client):
    payload = {
        "full_name": "Test Visitor", "email": "visitor@example.org", "phone": "+10000000000",
        "service": "Data Analytics & BI", "message": "This is an automated test message.",
    }
    r = client.post("/contact", json=payload)
    assert r.status_code == 201, r.text
    contact_id = r.json()["id"]
    assert contact_id > 0

    headers = _login(client)
    r = client.get("/admin/contacts", headers=headers)
    assert r.status_code == 200, r.text
    assert contact_id in [c["id"] for c in (r.json() if isinstance(r.json(), list) else r.json().get("items", r.json().get("contacts", [])))]


def test_newsletter(client):
    # Marketing consent is now mandatory (see tests/test_newsletter_platform.py for the full flow).
    r = client.post("/newsletter/subscribe", json={"email": "reader@example.org", "consent": True})
    assert r.status_code == 201, r.text
    dup = client.post("/newsletter/subscribe", json={"email": "reader@example.org", "consent": True})
    assert dup.status_code in (200, 201, 400, 409)


def test_visitor_tracking_and_analytics(client):
    r = client.post("/analytics/track", json={"visited_page": "/", "device": "Desktop", "browser": "Chrome"})
    assert r.status_code == 200 and r.json()["status"] == "logged"
    assert client.get("/analytics/summary").status_code == 401
    r = client.get("/analytics/summary", headers=_login(client))
    assert r.status_code == 200, r.text
    assert r.json()["total_views"] >= 1
