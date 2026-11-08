"""
Email-notification tests. Every outbound call (Resend HTTP, SMTP) is stubbed —
nothing is ever sent. Run from the backend folder:  python -m pytest tests -q
"""

import asyncio

import pytest

# Reuse the isolated app/test-DB setup (must be imported before any app module).
from test_health_and_routes import _login, client  # noqa: F401

from app.core.config import Settings
from app.models.contact_model import Contact
from app.services import email_delivery, email_service


def _settings(**overrides) -> Settings:
    base = dict(
        DATABASE_URL="sqlite://",
        ADMIN_EMAIL="owner@example.org",
        RESEND_API_KEY="",
        RESEND_FROM="",
        MAIL_FROM="me@gmail.com",
        MAIL_SERVER="",
        MAIL_USERNAME="",
        MAIL_PASSWORD="",
    )
    base.update(overrides)
    return Settings(_env_file=None, **base)


def _contact() -> Contact:
    return Contact(
        id=7, full_name="Ada Visitor", email="ada@example.org", phone="+10000000000",
        company=None, service="AI Agent / Workflow Automation",
        message="Hello, I would like to work with you.", ip_address="1.2.3.4", country="IN",
    )


def run(coro):
    return asyncio.run(coro)


@pytest.fixture
def sent(monkeypatch):
    """Record Resend/SMTP calls instead of sending."""
    calls = {"resend": [], "smtp_admin": [], "smtp_client": []}
    behaviour = {"resend_fail_to": set(), "smtp_fail": False}

    def fake_resend(settings, payload):
        if payload["to"][0] in behaviour["resend_fail_to"]:
            raise RuntimeError("Resend HTTP 403: You can only send testing emails to your own email address")
        calls["resend"].append(payload)
        return "msg_123"

    async def fake_smtp_admin(c, settings):
        if behaviour["smtp_fail"]:
            raise OSError("Connection timed out")
        calls["smtp_admin"].append(c.email)

    async def fake_smtp_client(c, settings):
        if behaviour["smtp_fail"]:
            raise OSError("Connection timed out")
        calls["smtp_client"].append(c.email)

    monkeypatch.setattr(email_delivery, "_resend_send", fake_resend)
    monkeypatch.setattr(email_service, "send_admin_alert_smtp", fake_smtp_admin)
    monkeypatch.setattr(email_service, "send_client_reply_smtp", fake_smtp_client)
    return calls, behaviour


def test_resend_alert_sent_even_when_auto_reply_rejected(sent):
    calls, behaviour = sent
    behaviour["resend_fail_to"].add("ada@example.org")  # Resend sandbox rejects visitors
    ok, note = run(email_delivery.send_emails_for(_contact(), _settings(RESEND_API_KEY="re_test")))
    assert ok is True
    assert "auto-reply not sent" in note
    alert = calls["resend"][0]
    assert alert["to"] == ["owner@example.org"]
    assert alert["reply_to"] == "ada@example.org"
    assert "Ada Visitor" in alert["html"] and "AI Agent / Workflow Automation" in alert["html"]


def test_resend_sends_both_when_allowed(sent):
    calls, _ = sent
    ok, note = run(email_delivery.send_emails_for(_contact(), _settings(RESEND_API_KEY="re_test")))
    assert (ok, note) == (True, None)
    assert [p["to"][0] for p in calls["resend"]] == ["owner@example.org", "ada@example.org"]


def test_falls_back_to_smtp_when_resend_fails(sent):
    calls, behaviour = sent
    behaviour["resend_fail_to"].add("owner@example.org")
    s = _settings(RESEND_API_KEY="re_test", MAIL_SERVER="smtp.gmail.com", MAIL_USERNAME="u", MAIL_PASSWORD="p")
    ok, note = run(email_delivery.send_emails_for(_contact(), s))
    assert (ok, note) == (True, None)
    assert calls["smtp_admin"] == ["ada@example.org"]


def test_failure_records_every_provider_error(sent):
    _, behaviour = sent
    behaviour["resend_fail_to"].add("owner@example.org")
    behaviour["smtp_fail"] = True
    s = _settings(RESEND_API_KEY="re_test", MAIL_SERVER="smtp.gmail.com", MAIL_USERNAME="u", MAIL_PASSWORD="p")
    ok, note = run(email_delivery.send_emails_for(_contact(), s))
    assert ok is False
    assert "Resend HTTP 403" in note and "SMTP: Connection timed out" in note


def test_no_provider_is_reported_not_faked(sent):
    ok, note = run(email_delivery.send_emails_for(_contact(), _settings()))
    assert ok is False
    assert "RESEND_API_KEY" in note


def test_smtp_send_raises_when_unconfigured():
    with pytest.raises(RuntimeError, match="SMTP is not configured"):
        run(email_service.send_contact_emails(_contact(), _settings()))


@pytest.mark.parametrize("resend_from, mail_from, expected", [
    ("", "me@gmail.com", "onboarding@resend.dev"),        # personal mailbox can't be a Resend sender
    ("", "noreply@example.com", "onboarding@resend.dev"),
    ("", "hello@meetchetanpura.in", "hello@meetchetanpura.in"),
    ("alerts@meetchetanpura.in", "me@gmail.com", "alerts@meetchetanpura.in"),
])
def test_resend_sender_selection(resend_from, mail_from, expected):
    s = _settings(RESEND_API_KEY="re_test", RESEND_FROM=resend_from, MAIL_FROM=mail_from)
    assert email_delivery._resend_sender(s) == expected


def test_status_has_no_secrets():
    s = _settings(RESEND_API_KEY="re_supersecret", MAIL_PASSWORD="hunter2", MAIL_SERVER="smtp.gmail.com", MAIL_USERNAME="u")
    status = email_delivery.email_provider_status(s)
    assert "re_supersecret" not in str(status) and "hunter2" not in str(status)
    assert status["resend_configured"] is True and status["smtp_configured"] is True


def test_notification_endpoints_require_admin(client):
    assert client.get("/admin/notifications/status").status_code == 401
    assert client.post("/admin/notifications/test").status_code == 401


def test_notification_endpoints_for_admin(client, monkeypatch):
    admin_headers = _login(client)
    status = client.get("/admin/notifications/status", headers=admin_headers)
    assert status.status_code == 200
    assert status.json()["admin_email"] == "admin-test@example.org"

    async def fake_test_alert(settings):
        return True, "Sent via Resend"
    from app.routes import notification_routes
    monkeypatch.setattr(notification_routes, "send_test_alert", fake_test_alert)
    r = client.post("/admin/notifications/test", headers=admin_headers)
    assert r.json() == {"sent": True, "to": "admin-test@example.org", "detail": "Sent via Resend"}
