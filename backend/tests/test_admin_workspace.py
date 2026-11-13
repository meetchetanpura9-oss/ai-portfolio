"""
Admin newsletter workspace: dashboard overview, Resend sync indicators, campaign
search/filter, per-campaign analytics and the settings status page.

Uses the same isolated SQLite database and fake Resend as test_newsletter_platform;
conftest.py additionally blocks every real outbound HTTP/SMTP call.
"""

from datetime import timedelta

from test_health_and_routes import client  # noqa: F401
from test_newsletter_platform import (  # noqa: F401 — fixtures + helpers
    SEGMENT,
    WEBHOOK_SECRET,
    _activate,
    _event,
    _new_campaign,
    _row,
    _sent_campaign,
    _subscribe,
    _webhook,
    admin,
    isolated,
    resend,
)

from app.core.config import get_settings
from app.database.connection import SessionLocal
from app.models.newsletter_model import NewsletterSubscriber
from app.models.user_model import User
from app.services import newsletter_service as svc
from app.services.auth_service import create_access_token, hash_password


def _overview(client, admin, **params):  # noqa: F811
    r = client.get("/admin/newsletter/overview", headers=admin, params=params)
    assert r.status_code == 200, r.text
    return r.json()


# --- Overview ------------------------------------------------------------------------
def test_overview_on_empty_database_reports_unknown_not_zero_rates(client, admin):  # noqa: F811
    data = _overview(client, admin)
    assert data["subscribers"]["total"] == 0
    assert data["campaigns"] == {"total": 0, "sent": 0, "completed": 0, "sending": 0, "scheduled": 0,
                                 "draft": 0, "failed": 0, "cancelled": 0}
    # No webhook events yet: every rate is "not reported" (None), never a made-up 0%.
    assert data["email"] == {"events_recorded": False, "delivery_rate": None, "open_rate": None,
                             "click_rate": None, "bounce_rate": None}
    assert len(data["growth"]) == 30 and all(
        day["signups"] == day["confirmed"] == day["unsubscribed"] == 0 for day in data["growth"])
    assert data["recent_campaigns"] == data["recent_subscribers"] == data["recent_events"] == []
    assert data["integration"] == {"resend_configured": True, "segment_configured": True,
                                   "webhook_configured": True, "last_webhook_at": None, "pending_sync": 0}


def test_overview_metrics_growth_and_recent_activity(client, resend, admin):  # noqa: F811
    campaign_id, bc = _sent_campaign(client, resend, admin, ["a@example.org", "b@example.org", "c@example.org"])
    _subscribe(client, "waiting@example.org")  # pending
    _new_campaign(client, admin, title="Second draft")
    for msg_id, event in [
        ("o1", _event("email.sent", bc, "a@example.org", "e-a")),
        ("o2", _event("email.sent", bc, "b@example.org", "e-b")),
        ("o3", _event("email.sent", bc, "c@example.org", "e-c")),
        ("o4", _event("email.sent", bc, "d@example.org", "e-d")),
        ("o5", _event("email.delivered", bc, "a@example.org", "e-a")),
        ("o6", _event("email.delivered", bc, "b@example.org", "e-b")),
        ("o7", _event("email.opened", bc, "a@example.org", "e-a")),
        ("o8", _event("email.bounced", bc, "c@example.org", "e-c", bounce={"type": "Permanent"})),
    ]:
        assert _webhook(client, event, msg_id=msg_id).status_code == 200

    data = _overview(client, admin)
    assert data["subscribers"] == {"pending": 1, "active": 2, "unsubscribed": 0, "suppressed": 1, "total": 4}
    assert data["campaigns"]["total"] == 2 and data["campaigns"]["draft"] == 1
    assert data["campaigns"]["completed"] == 1 and data["campaigns"]["sent"] == 1
    assert data["email"] == {"events_recorded": True, "delivery_rate": 50.0, "open_rate": 50.0,
                             "click_rate": 0.0, "bounce_rate": 25.0}

    today = data["growth"][-1]
    assert today["date"] == svc.utcnow().date().isoformat()
    assert (today["signups"], today["confirmed"], today["unsubscribed"]) == (4, 3, 1)
    assert sum(day["signups"] for day in data["growth"][:-1]) == 0

    assert "Second draft" in [c["title"] for c in data["recent_campaigns"]]
    assert any(c["id"] == campaign_id and c["status"] == "sent" for c in data["recent_campaigns"])
    activity = {row["email"]: row["activity"] for row in data["recent_subscribers"]}
    assert activity == {"a@example.org": "confirmed", "b@example.org": "confirmed",
                        "c@example.org": "suppressed", "waiting@example.org": "signed_up"}
    assert len(data["recent_events"]) == 8
    assert {e["event_type"] for e in data["recent_events"]} == {"sent", "delivered", "opened", "bounced"}
    assert data["integration"]["last_webhook_at"] is not None


def test_overview_growth_window_and_old_signups(client, admin):  # noqa: F811
    db = SessionLocal()
    old = svc.utcnow() - timedelta(days=10)
    db.add(NewsletterSubscriber(email="old@example.org", status="pending", subscribed_at=old))
    db.add(NewsletterSubscriber(email="ancient@example.org", status="pending",
                                subscribed_at=svc.utcnow() - timedelta(days=200)))
    db.commit()
    db.close()

    week = _overview(client, admin, days=7)["growth"]
    assert len(week) == 7 and sum(day["signups"] for day in week) == 0
    month = _overview(client, admin, days=30)["growth"]
    assert sum(day["signups"] for day in month) == 1
    assert next(day for day in month if day["signups"])["date"] == old.date().isoformat()
    assert client.get("/admin/newsletter/overview", headers=admin, params={"days": 3}).status_code == 422
    assert client.get("/admin/newsletter/overview", headers=admin, params={"days": 500}).status_code == 422


# --- Subscribers: Resend sync indicator ----------------------------------------------
def test_subscriber_list_shows_resend_sync_state(client, resend, admin, monkeypatch):  # noqa: F811
    _activate(client, resend, "synced@example.org")
    _subscribe(client, "pending@example.org")
    rows = {r["email"]: r for r in client.get("/admin/newsletter/subscribers", headers=admin).json()["items"]}
    assert rows["synced@example.org"]["in_resend"] is True
    assert rows["synced@example.org"]["resend_sync_pending"] is False
    # Unconfirmed contacts are never pushed to Resend.
    assert rows["pending@example.org"]["in_resend"] is False

    db = SessionLocal()
    db.query(NewsletterSubscriber).filter_by(email="synced@example.org").update({"resend_sync_pending": True})
    db.commit()
    db.close()
    rows = {r["email"]: r for r in client.get("/admin/newsletter/subscribers", headers=admin).json()["items"]}
    assert rows["synced@example.org"]["resend_sync_pending"] is True
    assert _overview(client, admin)["integration"]["pending_sync"] == 1

    synced = client.post("/admin/newsletter/subscribers/sync", headers=admin).json()
    assert synced == {"synced": 1, "remaining": 0}
    assert _overview(client, admin)["integration"]["pending_sync"] == 0


# --- Campaigns: search, filter, counts ------------------------------------------------
def test_campaign_search_filter_and_status_counts(client, resend, admin):  # noqa: F811
    _sent_campaign(client, resend, admin, ["reader@example.org"])  # title "November update"-style default
    _new_campaign(client, admin, title="RAG deep dive", subject="How retrieval works")
    _new_campaign(client, admin, title="Agents weekly", subject="100% practical_tips")

    everything = client.get("/admin/newsletter/campaigns", headers=admin).json()
    assert everything["total"] == 3
    assert everything["counts"] == {"all": 3, "draft": 2, "sent": 1} or \
        everything["counts"] == {"all": 3, "draft": 2, "sending": 1}

    def search(**params):
        return client.get("/admin/newsletter/campaigns", headers=admin, params=params).json()

    assert [c["title"] for c in search(search="rag")["items"]] == ["RAG deep dive"]           # title, case-insensitive
    assert [c["title"] for c in search(search="retrieval")["items"]] == ["RAG deep dive"]     # subject
    assert [c["title"] for c in search(search="100%")["items"]] == ["Agents weekly"]          # % is literal
    assert search(search="practical_tips")["total"] == 1 and search(search="practicalXtips")["total"] == 0
    assert search(search="nothing-matches")["items"] == []

    drafts = search(status="draft")
    assert drafts["total"] == 2 and drafts["counts"]["all"] == 3  # tab counts ignore the status filter
    filtered = search(status="draft", search="agents")
    assert filtered["total"] == 1 and filtered["counts"] == {"all": 1, "draft": 1}
    assert client.get("/admin/newsletter/campaigns", headers=admin, params={"status": "bogus"}).status_code == 422
    assert all("created_at" in c and "scheduled_at" in c and "sent_at" in c for c in everything["items"])


# --- Per-campaign analytics -----------------------------------------------------------
def test_campaign_analytics_detail(client, resend, admin):  # noqa: F811
    campaign_id, bc = _sent_campaign(client, resend, admin, ["a@example.org", "b@example.org"])
    url = f"/admin/newsletter/analytics/campaigns/{campaign_id}"

    before = client.get(url, headers=admin).json()
    assert before["tracking_available"] is False and before["recipients"] == 2
    assert before["delivered"] is None and before["open_rate"] is None
    assert before["timeline"] == [] and before["recent_events"] == []

    for msg_id, event in [
        ("d1", _event("email.sent", bc, "a@example.org", "e-a")),
        ("d2", _event("email.sent", bc, "b@example.org", "e-b")),
        ("d3", _event("email.delivered", bc, "a@example.org", "e-a")),
        ("d4", _event("email.opened", bc, "a@example.org", "e-a")),
        ("d5", _event("email.clicked", bc, "a@example.org", "e-a")),
        ("d6", _event("email.failed", bc, "b@example.org", "e-b")),
    ]:
        assert _webhook(client, event, msg_id=msg_id).status_code == 200

    detail = client.get(url, headers=admin).json()
    assert detail["tracking_available"] is True
    assert (detail["sent"], detail["delivered"], detail["opened"], detail["clicked"]) == (2, 1, 1, 1)
    assert (detail["failed"], detail["bounced"], detail["complained"]) == (1, 0, 0)
    assert (detail["delivery_rate"], detail["open_rate"], detail["click_rate"], detail["bounce_rate"]) == \
        (50.0, 100.0, 100.0, 0.0)
    assert detail["timeline"] == [{"date": "2026-11-12", "sent": 2, "delivered": 1, "opened": 1,
                                   "clicked": 1, "failed": 1}]
    assert len(detail["recent_events"]) == 6 and detail["recent_events"][0]["email"] in ("a@example.org", "b@example.org")

    report = client.get("/admin/newsletter/analytics", headers=admin).json()
    assert report["campaigns"][0]["failed"] == 1 and report["totals"]["failed"] == 1
    assert report["totals"]["open_rate"] == 100.0 and report["totals"]["bounce_rate"] == 0.0
    assert client.get("/admin/newsletter/analytics/campaigns/999999", headers=admin).status_code == 404


# --- Settings ------------------------------------------------------------------------
def test_settings_reports_urls_and_status_without_secrets(client, admin, monkeypatch):  # noqa: F811
    settings = get_settings()
    monkeypatch.setattr(settings, "API_BASE_URL", "https://api.example.test/")
    cfg = client.get("/admin/newsletter/settings", headers=admin).json()
    assert cfg["api_base_url"] == "https://api.example.test"
    assert cfg["webhook_url"] == "https://api.example.test/webhooks/resend"
    assert cfg["sender_configured"] is True and cfg["app_base_url"].startswith("https://")
    body = client.get("/admin/newsletter/settings", headers=admin).text
    for secret in (settings.RESEND_API_KEY, WEBHOOK_SECRET, WEBHOOK_SECRET.removeprefix("whsec_"), SEGMENT,
                   settings.DATABASE_URL, settings.ADMIN_PASSWORD):
        assert secret and secret not in body

    monkeypatch.setattr(settings, "RESEND_FROM", "")
    assert client.get("/admin/newsletter/settings", headers=admin).json()["sender_configured"] is False


# --- Authorization -------------------------------------------------------------------
def test_new_workspace_endpoints_require_admin_role(client):  # noqa: F811
    db = SessionLocal()
    if not db.query(User).filter_by(email="viewer-ws@example.org").first():
        db.add(User(name="Viewer", email="viewer-ws@example.org", hashed_password=hash_password("pw-123456"),
                    role="viewer"))
        db.commit()
    db.close()
    viewer = {"Authorization": f"Bearer {create_access_token({'sub': 'viewer-ws@example.org'})}"}
    try:
        for path in ("/admin/newsletter/overview", "/admin/newsletter/analytics/campaigns/1",
                     "/admin/newsletter/campaigns?search=x", "/admin/newsletter/settings"):
            assert client.get(path).status_code == 401, path
            assert client.get(path, headers={"Authorization": "Bearer not-a-token"}).status_code == 401, path
            assert client.get(path, headers=viewer).status_code == 403, path
    finally:  # other tests expect exactly one (admin) user
        db = SessionLocal()
        db.query(User).filter_by(email="viewer-ws@example.org").delete()
        db.commit()
        db.close()
