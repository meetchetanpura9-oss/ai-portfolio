"""
Newsletter, case-study CMS, campaign, unsubscribe and webhook tests.

Everything runs against the throwaway SQLite database set up in test_health_and_routes
and a fake Resend API — no network call is made and no real email can be sent.

Run from the backend folder:  python -m pytest tests -q
"""

import base64
import hashlib
import hmac
import json
import re
import time
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine, inspect, text

# Reuse the isolated app/test-DB setup (must be imported before any app module).
from test_health_and_routes import _login, client  # noqa: F401

import app.routes.case_study_routes as case_study_routes
import app.routes.newsletter_routes as newsletter_routes
from app.core.config import get_settings
from app.database.connection import SessionLocal
from app.database.migrations import run_migrations
from app.models.newsletter_model import (
    CaseStudy,
    MediaAsset,
    NewsletterCampaign,
    NewsletterEmailEvent,
    NewsletterSubscriber,
    NewsletterWebhookEvent,
)
from app.models.user_model import User
from app.services import campaign_service, resend_client
from app.services import newsletter_service as svc
from app.services.auth_service import create_access_token, hash_password
from app.services.markdown_renderer import UNSUBSCRIBE_PLACEHOLDER, render_markdown
from app.services.rate_limiter import rate_limiter
from app.services.resend_client import ResendError

WEBHOOK_SECRET = "whsec_" + base64.b64encode(b"test-webhook-signing-key-0123456").decode()
SEGMENT = "seg-11111111"
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


class FakeResend:
    """Records every Resend API call and returns canned responses."""

    def __init__(self):
        self.calls: list[tuple[str, str, dict | None]] = []
        self.fail: dict[tuple[str, str], ResendError] = {}
        self.broadcast_status = "draft"
        self._n = 0

    def __call__(self, method, path, body=None, idempotency_key=None, timeout=20):
        self.calls.append((method, path, body))
        for (m, prefix), error in self.fail.items():
            if m == method and path.startswith(prefix):
                raise error
        self._n += 1
        if method == "GET" and path.startswith("/broadcasts/"):
            return {"id": path.rsplit("/", 1)[-1], "status": self.broadcast_status}
        if method == "POST" and path == "/broadcasts":
            return {"id": f"bc-{self._n}"}
        if method == "POST" and path == "/contacts":
            return {"id": f"contact-{self._n}"}
        return {"id": f"obj-{self._n}"}

    def of(self, method, prefix):
        return [c for c in self.calls if c[0] == method and c[1].startswith(prefix)]

    @property
    def emails(self):
        return [c[2] for c in self.of("POST", "/emails")]


@pytest.fixture(autouse=True)
def isolated(monkeypatch):
    """Clean newsletter tables, reset rate limiters and enable a fake Resend for each test."""
    db = SessionLocal()
    for model in (NewsletterEmailEvent, NewsletterWebhookEvent, NewsletterCampaign,
                  CaseStudy, MediaAsset, NewsletterSubscriber):
        db.query(model).delete()
    db.commit()
    db.close()
    for limiter in (rate_limiter, newsletter_routes.subscribe_limiter,
                    newsletter_routes.token_limiter, case_study_routes.read_limiter):
        limiter._hits.clear()

    settings = get_settings()
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key")
    monkeypatch.setattr(settings, "RESEND_FROM", "hello@meetchetanpura.in")
    monkeypatch.setattr(settings, "RESEND_NEWSLETTER_SEGMENT_ID", SEGMENT)
    monkeypatch.setattr(settings, "RESEND_WEBHOOK_SECRET", WEBHOOK_SECRET)
    monkeypatch.setattr(settings, "NEWSLETTER_DOUBLE_OPT_IN", True)
    monkeypatch.setattr(campaign_service.time, "sleep", lambda *_: None)


@pytest.fixture
def resend(monkeypatch):
    fake = FakeResend()
    monkeypatch.setattr(resend_client, "resend_request", fake)
    return fake


@pytest.fixture
def admin(client):  # noqa: F811
    return _login(client)


def _token_from(payload: dict) -> str:
    return re.search(r"/newsletter/confirm\?token=([\w-]+)", payload["html"]).group(1)


def _subscribe(client, email, **extra):  # noqa: F811
    return client.post("/newsletter/subscribe", json={"email": email, "consent": True, **extra})


def _activate(client, resend, email):  # noqa: F811
    """Subscribe + confirm through the public API. Returns the subscriber id."""
    before = len(resend.emails)
    assert _subscribe(client, email).status_code == 201
    token = _token_from(resend.emails[before])
    assert client.post("/newsletter/confirm", json={"token": token}).json()["status"] == "confirmed"
    return _row(email).id


def _row(email) -> NewsletterSubscriber:
    db = SessionLocal()
    try:
        return db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    finally:
        db.close()


def _unsub_token(email) -> str:
    return svc.unsubscribe_token(get_settings(), _row(email))


# ====================================================================================
# TEST A — Subscription
# ====================================================================================
def test_subscribe_records_consent_and_sends_confirmation(client, resend):  # noqa: F811
    r = _subscribe(client, "Reader@Example.org", source="footer")
    assert r.status_code == 201, r.text
    row = _row("reader@example.org")
    assert row.status == "pending"  # not active until confirmed
    assert row.consent_given is True and row.consent_timestamp is not None
    assert row.subscription_source == "footer" and row.consent_text
    assert len(resend.emails) == 1
    assert resend.emails[0]["to"] == ["reader@example.org"]
    assert resend.emails[0]["from"] == "Meet Chetanpura <hello@meetchetanpura.in>"
    # Nothing is pushed to the Resend audience before confirmation.
    assert resend.of("POST", "/contacts") == []


def test_subscribe_invalid_email(client, resend):  # noqa: F811
    assert _subscribe(client, "not-an-email").status_code == 422
    assert resend.calls == []


def test_subscribe_requires_consent(client, resend):  # noqa: F811
    r = client.post("/newsletter/subscribe", json={"email": "noconsent@example.org"})
    assert r.status_code == 422
    assert "consent" in r.json()["detail"].lower()
    assert _row("noconsent@example.org") is None and resend.calls == []
    assert client.post("/newsletter/subscribe",
                       json={"email": "noconsent@example.org", "consent": False}).status_code == 422


def test_duplicate_subscription_is_single_row_and_not_re_emailed(client, resend):  # noqa: F811
    first = _subscribe(client, "dup@example.org")
    second = _subscribe(client, "dup@example.org")
    assert first.status_code == second.status_code == 201
    # Same wording either way: the API does not reveal whether an address is on the list.
    assert first.json() == second.json()
    db = SessionLocal()
    assert db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == "dup@example.org").count() == 1
    db.close()
    assert len(resend.emails) == 1  # throttled: no second confirmation moments later


def test_subscribe_rate_limited(client, resend):  # noqa: F811
    limit = get_settings().RATE_LIMIT_REQUESTS
    codes = [_subscribe(client, f"rl{i}@example.org").status_code for i in range(limit + 1)]
    assert codes[:limit] == [201] * limit and codes[-1] == 429


def test_honeypot_submission_is_ignored(client, resend):  # noqa: F811
    r = _subscribe(client, "bot@example.org", website="http://spam.example")
    assert r.status_code == 201
    assert _row("bot@example.org") is None and resend.calls == []


# ====================================================================================
# TEST B — Confirmation + welcome email
# ====================================================================================
def test_confirmation_activates_and_sends_one_welcome(client, resend, caplog):  # noqa: F811
    _subscribe(client, "new@example.org")
    token = _token_from(resend.emails[0])
    row = _row("new@example.org")
    assert row.confirmation_token_hash == hashlib.sha256(token.encode()).hexdigest()
    assert token not in (row.confirmation_token_hash or "")  # only the hash is stored

    r = client.post("/newsletter/confirm", json={"token": token})
    assert r.status_code == 200 and r.json()["status"] == "confirmed"
    row = _row("new@example.org")
    assert row.status == "active" and row.confirmed_at is not None and row.welcome_sent_at is not None

    welcome = [e for e in resend.emails if e["subject"] == "Welcome to My AI & Technology Newsletter!"]
    assert len(welcome) == 1
    assert welcome[0]["to"] == ["new@example.org"]
    assert welcome[0]["from"] == "Meet Chetanpura <hello@meetchetanpura.in>"
    for phrase in ("Thank you for joining my newsletter!", "Agentic AI", "RAG and AI Agents",
                   "https://www.meetchetanpura.in", "Unsubscribe"):
        assert phrase in welcome[0]["html"]
    assert welcome[0]["headers"]["List-Unsubscribe-Post"] == "List-Unsubscribe=One-Click"

    # Only now is the contact created in Resend, inside the newsletter segment.
    contact = resend.of("POST", "/contacts")[0][2]
    assert contact == {"email": "new@example.org", "unsubscribed": False, "segments": [{"id": SEGMENT}]}
    assert row.resend_contact_id and row.resend_sync_pending is False

    # Repeated confirmation is idempotent and never sends a second welcome.
    again = client.post("/newsletter/confirm", json={"token": token})
    assert again.status_code == 200 and again.json()["status"] == "already_confirmed"
    assert client.get("/newsletter/confirm", params={"token": token}).json()["status"] == "already_confirmed"
    assert len([e for e in resend.emails if e["subject"].startswith("Welcome")]) == 1

    assert token not in caplog.text  # tokens never reach the logs


def test_expired_confirmation_token(client, resend):  # noqa: F811
    _subscribe(client, "late@example.org")
    token = _token_from(resend.emails[0])
    db = SessionLocal()
    db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == "late@example.org").update(
        {"confirmation_expires_at": datetime.now(timezone.utc) - timedelta(minutes=1)})
    db.commit()
    db.close()
    r = client.post("/newsletter/confirm", json={"token": token})
    assert r.status_code == 410
    assert _row("late@example.org").status == "pending"
    assert len(resend.emails) == 1  # no welcome


def test_invalid_confirmation_token(client, resend):  # noqa: F811
    assert client.post("/newsletter/confirm", json={"token": "x" * 43}).status_code == 400
    assert client.post("/newsletter/confirm", json={"token": "short"}).status_code == 422


def test_welcome_claim_is_atomic(client, resend):  # noqa: F811
    subscriber_id = _activate(client, resend, "once@example.org")
    db = SessionLocal()
    assert svc.claim_welcome_email(db, subscriber_id) is False  # already claimed by the confirm
    db.close()
    svc.complete_activation(subscriber_id, "https://api.example")  # running it again sends nothing
    assert len([e for e in resend.emails if e["subject"].startswith("Welcome")]) == 1


def test_legacy_rows_are_migrated_as_unconsented_pending(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE newsletter_subscribers (id INTEGER PRIMARY KEY, "
                          "email VARCHAR(255) NOT NULL UNIQUE, subscribed_at DATETIME NOT NULL)"))
        conn.execute(text("INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES "
                          "('old1@example.org', '2026-01-01 00:00:00'), ('old2@example.org', '2026-02-01 00:00:00')"))
    run_migrations(engine)
    run_migrations(engine)  # idempotent
    columns = {c["name"] for c in inspect(engine).get_columns("newsletter_subscribers")}
    assert {"status", "consent_given", "confirmation_token_hash", "unsubscribed_at", "resend_contact_id"} <= columns
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT email, status, consent_given, subscription_source, subscribed_at "
                                 "FROM newsletter_subscribers ORDER BY id")).all()
    assert [r[0] for r in rows] == ["old1@example.org", "old2@example.org"]  # data preserved
    assert all(r[1] == "pending" and not r[2] and r[3] == "legacy" for r in rows)  # never auto-consented
    assert str(rows[0][4]).startswith("2026-01-01")


# ====================================================================================
# TEST C — Subscriber management
# ====================================================================================
def test_admin_endpoints_require_admin_role(client, resend):  # noqa: F811
    paths = ["/admin/newsletter/subscribers", "/admin/newsletter/subscribers/export",
             "/admin/newsletter/campaigns", "/admin/newsletter/analytics", "/admin/newsletter/overview",
             "/admin/newsletter/settings", "/admin/case-studies", "/admin/media"]
    for path in paths:
        assert client.get(path).status_code == 401, path
        assert client.get(path, headers={"Authorization": "Bearer not-a-jwt"}).status_code == 401, path

    db = SessionLocal()
    if not db.query(User).filter(User.email == "viewer@example.org").first():
        db.add(User(name="Viewer", email="viewer@example.org", hashed_password=hash_password("x" * 12), role="viewer"))
        db.commit()
    db.close()
    viewer = {"Authorization": f"Bearer {create_access_token({'sub': 'viewer@example.org'})}"}
    for path in paths:
        assert client.get(path, headers=viewer).status_code == 403, path
    assert client.post("/admin/newsletter/campaigns", headers=viewer,
                       json={"title": "x", "subject": "y"}).status_code == 403
    db = SessionLocal()
    db.query(User).filter(User.email == "viewer@example.org").delete()
    db.commit()
    db.close()


def test_subscriber_search_filter_sort_pagination(client, resend, admin):  # noqa: F811
    db = SessionLocal()
    base = datetime(2026, 1, 1, tzinfo=timezone.utc)
    for i in range(25):
        db.add(NewsletterSubscriber(
            email=f"user{i:02d}@{'alpha' if i % 2 else 'beta'}.org",
            status=("active", "pending", "unsubscribed")[i % 3],
            consent_given=True, subscribed_at=base + timedelta(days=i)))
    db.commit()
    db.close()

    r = client.get("/admin/newsletter/subscribers", headers=admin, params={"page_size": 10}).json()
    assert r["total"] == 25 and len(r["items"]) == 10 and r["items"][0]["email"] == "user24@beta.org"
    assert r["counts"] == {"pending": 8, "active": 9, "unsubscribed": 8, "suppressed": 0, "total": 25}
    page3 = client.get("/admin/newsletter/subscribers", headers=admin, params={"page_size": 10, "page": 3}).json()
    assert len(page3["items"]) == 5
    oldest = client.get("/admin/newsletter/subscribers", headers=admin, params={"sort": "oldest"}).json()
    assert oldest["items"][0]["email"] == "user00@beta.org"

    found = client.get("/admin/newsletter/subscribers", headers=admin, params={"search": "ALPHA"}).json()
    assert found["total"] == 12 and all("alpha" in s["email"] for s in found["items"])
    assert client.get("/admin/newsletter/subscribers", headers=admin, params={"search": "%"}).json()["total"] == 0
    active = client.get("/admin/newsletter/subscribers", headers=admin, params={"status": "active"}).json()
    assert active["total"] == 9 and {s["status"] for s in active["items"]} == {"active"}
    assert client.get("/admin/newsletter/subscribers", headers=admin, params={"status": "bogus"}).status_code == 422
    assert client.get("/admin/newsletter/subscribers", headers=admin, params={"page_size": 5000}).status_code == 422


def test_subscriber_csv_export(client, resend, admin):  # noqa: F811
    _activate(client, resend, "csv@example.org")
    db = SessionLocal()
    db.add(NewsletterSubscriber(email="=cmd@example.org", status="pending"))
    db.commit()
    db.close()
    r = client.get("/admin/newsletter/subscribers/export", headers=admin)
    assert r.status_code == 200 and r.headers["content-type"].startswith("text/csv")
    assert "attachment" in r.headers["content-disposition"]
    lines = r.text.lstrip("﻿").strip().splitlines()
    assert lines[0].startswith("id,email,first_name,status,consent_given")
    assert any("csv@example.org" in line and ",active,yes," in line for line in lines)
    assert any("'=cmd@example.org" in line for line in lines)  # formula injection neutralised
    only = client.get("/admin/newsletter/subscribers/export", headers=admin, params={"status": "active"})
    assert "cmd@example.org" not in only.text


def test_admin_can_unsubscribe_but_never_activate(client, resend, admin):  # noqa: F811
    subscriber_id = _activate(client, resend, "managed@example.org")
    detail = client.get(f"/admin/newsletter/subscribers/{subscriber_id}", headers=admin).json()
    assert detail["status"] == "active" and detail["consent_given"] and detail["in_resend"]

    r = client.patch(f"/admin/newsletter/subscribers/{subscriber_id}", headers=admin, json={"action": "unsubscribe"})
    assert r.status_code == 200 and r.json() == {"status": "unsubscribed", "changed": True}
    row = _row("managed@example.org")
    assert row.unsubscribe_source == "admin" and row.unsubscribed_at is not None
    assert resend.of("PATCH", "/contacts/")[-1][2] == {"unsubscribed": True}  # synced to Resend

    # There is no admin action that makes someone active.
    for action in ("activate", "subscribe", "active"):
        assert client.patch(f"/admin/newsletter/subscribers/{subscriber_id}", headers=admin,
                            json={"action": action}).status_code == 422
    assert client.patch(f"/admin/newsletter/subscribers/{subscriber_id}", headers=admin,
                        json={"action": "resend_confirmation"}).status_code == 409
    assert client.patch(f"/admin/newsletter/subscribers/{subscriber_id}", headers=admin,
                        json={"action": "suppress"}).json()["status"] == "suppressed"
    assert client.get("/admin/newsletter/subscribers/999999", headers=admin).status_code == 404


# ====================================================================================
# TEST D — Case studies
# ====================================================================================
STUDY = {
    "title": "AI Inventory Intelligence",
    "summary": "Inventory software with a separate frontend and backend.",
    "category": "Data Analytics",
    "problem_statement": "Stock was tracked **by hand**.\n\n<script>alert(1)</script>",
    "solution": "A dashboard.\n\n- Fast\n- Simple\n\n[site](https://example.org) [bad](javascript:alert(1))",
    "technologies": ["TypeScript", "Docker", " "],
    "key_features": ["Stock alerts", "Dashboards"],
    "architecture_steps": ["UI", "API", "DB"],
    "screenshots": [{"src": "/projects/ai-portfolio.png", "alt": "Home"}],
    "github_url": "https://github.com/meetchetanpura9-oss/AI-Inventory-Intelligence-Platform",
    "seo_title": "AI Inventory Intelligence — case study",
    "seo_description": "How the inventory platform was built.",
    "featured": True,
}


def test_case_study_draft_edit_preview_publish_flow(client, resend, admin):  # noqa: F811
    created = client.post("/admin/case-studies", headers=admin, json=STUDY)
    assert created.status_code == 201, created.text
    study = created.json()
    assert study["status"] == "draft" and study["slug"] == "ai-inventory-intelligence"
    assert study["technologies"] == ["TypeScript", "Docker"]

    # Draft protection: not listed, not readable, no share page.
    assert client.get("/case-studies").json()["items"] == []
    assert client.get(f"/case-studies/{study['slug']}").status_code == 404
    assert client.get(f"/case-studies/{study['slug']}/share").status_code == 404

    # Edit + admin preview (rendered sections and the editable source).
    edited = client.put(f"/admin/case-studies/{study['id']}", headers=admin,
                        json={**STUDY, "summary": "Updated summary."})
    assert edited.status_code == 200 and edited.json()["summary"] == "Updated summary."
    preview = client.get(f"/admin/case-studies/{study['id']}", headers=admin).json()
    assert "<strong>by hand</strong>" in preview["sections"]["problem_statement"]
    assert preview["source"]["problem_statement"].startswith("Stock was tracked")

    # Content is sanitised: no raw HTML, no javascript: links.
    assert "<script>" not in preview["sections"]["problem_statement"]
    assert "&lt;script&gt;" in preview["sections"]["problem_statement"]
    assert "javascript:" not in preview["sections"]["solution"]
    assert 'href="https://example.org"' in preview["sections"]["solution"]
    assert "<ul><li>Fast</li><li>Simple</li></ul>" in preview["sections"]["solution"]

    published = client.post(f"/admin/case-studies/{study['id']}/publish", headers=admin)
    assert published.status_code == 200 and published.json()["status"] == "published"
    assert resend.calls == []  # publishing never sends email

    # Public access without any login.
    listing = client.get("/case-studies").json()
    assert listing["total"] == 1 and listing["categories"] == ["Data Analytics"]
    public = client.get(f"/case-studies/{study['slug']}").json()
    assert public["title"] == STUDY["title"] and "source" not in public
    assert public["seo_title"] == STUDY["seo_title"] and public["seo_description"] == STUDY["seo_description"]
    assert public["canonical_url"] == "https://www.meetchetanpura.in/case-studies/ai-inventory-intelligence"
    assert public["sections"]["results"] == ""  # empty sections stay empty: nothing is invented

    share = client.get(f"/case-studies/{study['slug']}/share")
    assert 'property="og:title" content="AI Inventory Intelligence — case study"' in share.text
    assert f'rel="canonical" href="{public["canonical_url"]}"' in share.text
    assert f"/case-studies/{study['slug']}</loc>" in client.get("/case-studies/sitemap.xml").text

    # Unpublish hides it again.
    assert client.post(f"/admin/case-studies/{study['id']}/unpublish", headers=admin).json()["status"] == "draft"
    assert client.get(f"/case-studies/{study['slug']}").status_code == 404

    # Delete needs explicit confirmation.
    assert client.delete(f"/admin/case-studies/{study['id']}", headers=admin).status_code == 400
    assert client.delete(f"/admin/case-studies/{study['id']}?confirm=true", headers=admin).status_code == 204
    assert client.get(f"/admin/case-studies/{study['id']}", headers=admin).status_code == 404


def test_case_study_validation_slugs_and_related(client, resend, admin):  # noqa: F811
    first = client.post("/admin/case-studies", headers=admin, json=STUDY).json()
    second = client.post("/admin/case-studies", headers=admin, json=STUDY).json()
    assert second["slug"] == "ai-inventory-intelligence-2"  # unique slugs

    assert client.post("/admin/case-studies", headers=admin,
                       json={**STUDY, "category": "Astrology"}).status_code == 422
    assert client.post("/admin/case-studies", headers=admin,
                       json={**STUDY, "github_url": "javascript:alert(1)"}).status_code == 422
    assert client.post("/admin/case-studies", headers=admin, json={"title": ""}).status_code == 422

    bare = client.post("/admin/case-studies", headers=admin, json={"title": "Bare"}).json()
    r = client.post(f"/admin/case-studies/{bare['id']}/publish", headers=admin)
    assert r.status_code == 422 and "summary" in r.json()["detail"]

    for item in (first, second):
        client.post(f"/admin/case-studies/{item['id']}/publish", headers=admin)
    related = client.get(f"/case-studies/{first['slug']}").json()["related"]
    assert [r["slug"] for r in related] == [second["slug"]]
    assert client.get("/case-studies", params={"category": "Agentic AI"}).json()["total"] == 0


def test_image_upload_validation(client, resend, admin):  # noqa: F811
    ok = client.post("/admin/media?filename=My Cover.PNG", headers={**admin, "Content-Type": "image/png"}, content=PNG)
    assert ok.status_code == 201, ok.text
    url = ok.json()["url"]
    assert url.endswith("/my-cover.png")
    served = client.get(url.replace("http://testserver", ""))
    assert served.status_code == 200 and served.content == PNG
    assert served.headers["x-content-type-options"] == "nosniff"
    assert client.get("/admin/media", headers=admin).json()["items"][0]["filename"] == "my-cover.png"

    fake = client.post("/admin/media", headers={**admin, "Content-Type": "image/png"}, content=b"<svg onload=alert(1)>")
    assert fake.status_code == 415  # content does not match the declared type
    assert client.post("/admin/media", headers={**admin, "Content-Type": "image/svg+xml"},
                       content=b"<svg/>").status_code == 415
    big = client.post("/admin/media", headers={**admin, "Content-Type": "image/png"},
                      content=PNG + b"\x00" * (2 * 1024 * 1024))
    assert big.status_code == 413
    assert client.post("/admin/media", headers={"Content-Type": "image/png"}, content=PNG).status_code == 401


# ====================================================================================
# TEST E — Campaigns
# ====================================================================================
CAMPAIGN = {
    "title": "November update",
    "subject": "What I built this month",
    "preview_text": "Agents, RAG and a new case study",
    "content": "# Hello\n\nNew work this month.\n\n![cover](https://example.org/a.png)\n\n"
               "[[button: Read more | /case-studies/demo]]\n\n<img src=x onerror=alert(1)>",
}


def _new_campaign(client, admin, **overrides):  # noqa: F811
    r = client.post("/admin/newsletter/campaigns", headers=admin, json={**CAMPAIGN, **overrides})
    assert r.status_code == 201, r.text
    return r.json()


def test_campaign_draft_edit_and_preview(client, resend, admin):  # noqa: F811
    campaign = _new_campaign(client, admin)
    assert campaign["status"] == "draft" and campaign["editable"] is True

    edited = client.put(f"/admin/newsletter/campaigns/{campaign['id']}", headers=admin,
                        json={**CAMPAIGN, "subject": "  Edited\nsubject  "})
    assert edited.status_code == 200 and edited.json()["subject"] == "Edited subject"  # single line

    preview = client.post(f"/admin/newsletter/campaigns/{campaign['id']}/preview", headers=admin).json()
    html = preview["html"]
    assert UNSUBSCRIBE_PLACEHOLDER in html and "Unsubscribe" in html  # every campaign carries the link
    assert '<a href="https://www.meetchetanpura.in/case-studies/demo"' in html  # CTA button, absolute URL
    assert '<img src="https://example.org/a.png"' in html and "<h1" in html
    assert "onerror" not in html.replace("&lt;img src=x onerror=alert(1)&gt;", "")  # raw HTML is escaped
    assert preview["eligible_recipients"] == 0 and preview["ready"] is False
    assert any("no active" in p for p in preview["problems"])

    unsaved = client.post("/admin/newsletter/campaigns/preview", headers=admin, json={"content": "## Draft"})
    assert "<h2" in unsaved.json()["html"]
    assert client.get("/admin/newsletter/campaigns", headers=admin).json()["total"] == 1
    assert resend.calls == []  # drafting and previewing never contact Resend


def test_campaign_test_email_goes_to_admin_only(client, resend, admin):  # noqa: F811
    _activate(client, resend, "sub1@example.org")
    campaign = _new_campaign(client, admin)
    before = len(resend.emails)
    r = client.post(f"/admin/newsletter/campaigns/{campaign['id']}/test", headers=admin)
    assert r.status_code == 200 and r.json() == {"sent": True, "to": get_settings().ADMIN_EMAIL}
    sent = resend.emails[before:]
    assert len(sent) == 1 and sent[0]["to"] == [get_settings().ADMIN_EMAIL]
    assert sent[0]["subject"] == "[TEST] What I built this month"
    assert UNSUBSCRIBE_PLACEHOLDER not in sent[0]["html"]
    assert resend.of("POST", "/broadcasts") == []  # a test never creates a broadcast
    assert client.get(f"/admin/newsletter/campaigns/{campaign['id']}", headers=admin).json()["status"] == "draft"


def test_campaign_send_requires_confirmation_and_cannot_repeat(client, resend, admin):  # noqa: F811
    _activate(client, resend, "a@example.org")
    _activate(client, resend, "b@example.org")
    _subscribe(client, "pending@example.org")  # pending: must not count
    campaign = _new_campaign(client, admin)
    url = f"/admin/newsletter/campaigns/{campaign['id']}"

    preview = client.post(f"{url}/preview", headers=admin).json()
    assert preview["eligible_recipients"] == 2 and preview["ready"] is True

    assert client.post(f"{url}/send", headers=admin, json={}).status_code == 400
    assert client.post(f"{url}/send", headers=admin, json={"confirm": False}).status_code == 400
    stale = client.post(f"{url}/send", headers=admin, json={"confirm": True, "expected_recipients": 5})
    assert stale.status_code == 409  # audience changed since the admin reviewed it
    assert resend.of("POST", "/broadcasts") == []

    sent = client.post(f"{url}/send", headers=admin, json={"confirm": True, "expected_recipients": 2})
    assert sent.status_code == 200, sent.text
    assert sent.json()["status"] == "sending" and sent.json()["recipient_count"] == 2
    create, send = resend.of("POST", "/broadcasts")
    assert create[1] == "/broadcasts" and create[2]["segment_id"] == SEGMENT
    assert create[2]["from"] == "Meet Chetanpura <hello@meetchetanpura.in>"
    assert create[2]["subject"] == CAMPAIGN["subject"] and UNSUBSCRIBE_PLACEHOLDER in create[2]["html"]
    assert re.fullmatch(r"/broadcasts/bc-\d+/send", send[1]) and send[2] == {}
    # Bulk delivery is one broadcast, never one request per subscriber.
    assert len(resend.emails) == 5  # 3 confirmations + 2 welcomes from setup; none for the campaign

    # Duplicate protection: a second click / second tab does nothing.
    calls = len(resend.calls)
    again = client.post(f"{url}/send", headers=admin, json={"confirm": True})
    assert again.status_code == 409 and len(resend.of("POST", "/broadcasts")) == 2
    assert client.post(f"{url}/schedule", headers=admin, json={
        "confirm": True, "scheduled_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
    }).status_code == 409
    assert len(resend.of("POST", "/broadcasts")) == 2 and len(resend.calls) == calls
    # A sent campaign is a record: not editable, not deletable.
    assert client.put(url, headers=admin, json=CAMPAIGN).status_code == 409
    assert client.delete(url, headers=admin).status_code == 409

    resend.broadcast_status = "sent"
    assert client.post(f"{url}/refresh", headers=admin).json()["status"] == "sent"
    copy = client.post(f"{url}/duplicate", headers=admin).json()
    assert copy["status"] == "draft" and copy["id"] != campaign["id"]


def test_campaign_schedule_and_cancel(client, resend, admin):  # noqa: F811
    _activate(client, resend, "a@example.org")
    campaign = _new_campaign(client, admin)
    url = f"/admin/newsletter/campaigns/{campaign['id']}"

    past = client.post(f"{url}/schedule", headers=admin, json={
        "confirm": True, "scheduled_at": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()})
    assert past.status_code == 400
    when = datetime.now(timezone.utc) + timedelta(days=1)
    assert client.post(f"{url}/schedule", headers=admin,
                       json={"scheduled_at": when.isoformat()}).status_code == 400  # no confirmation

    r = client.post(f"{url}/schedule", headers=admin, json={"confirm": True, "scheduled_at": when.isoformat()})
    assert r.status_code == 200 and r.json()["status"] == "scheduled", r.text
    send_call = resend.of("POST", "/broadcasts/")[0]
    assert send_call[2]["scheduled_at"].startswith(when.strftime("%Y-%m-%dT%H:%M")) and send_call[2]["scheduled_at"].endswith("Z")

    cancelled = client.post(f"{url}/cancel", headers=admin)
    assert cancelled.status_code == 200 and cancelled.json()["status"] == "cancelled"
    assert len(resend.of("DELETE", "/broadcasts/")) == 1
    assert client.post(f"{url}/cancel", headers=admin).status_code == 409  # nothing left to cancel
    assert client.post(f"{url}/send", headers=admin, json={"confirm": True}).status_code == 409


def test_campaign_blocked_without_setup_or_while_sync_pending(client, resend, admin, monkeypatch):  # noqa: F811
    campaign = _new_campaign(client, admin)
    url = f"/admin/newsletter/campaigns/{campaign['id']}"
    assert client.post(f"{url}/send", headers=admin, json={"confirm": True}).status_code == 400  # no subscribers

    _activate(client, resend, "a@example.org")
    monkeypatch.setattr(get_settings(), "RESEND_NEWSLETTER_SEGMENT_ID", "")
    r = client.post(f"{url}/send", headers=admin, json={"confirm": True})
    assert r.status_code == 400 and "SEGMENT" in r.json()["detail"]
    monkeypatch.setattr(get_settings(), "RESEND_NEWSLETTER_SEGMENT_ID", SEGMENT)

    # An unsubscribe that has not reached Resend yet blocks the send.
    subscriber_id = _activate(client, resend, "leaving@example.org")
    resend.fail[("PATCH", "/contacts/")] = ResendError(None, "timeout")
    client.patch(f"/admin/newsletter/subscribers/{subscriber_id}", headers=admin, json={"action": "unsubscribe"})
    assert _row("leaving@example.org").resend_sync_pending is True
    blocked = client.post(f"{url}/send", headers=admin, json={"confirm": True})
    assert blocked.status_code == 409 and "Sync" in blocked.json()["detail"]
    assert resend.of("POST", "/broadcasts") == []

    resend.fail.clear()
    assert client.post("/admin/newsletter/subscribers/sync", headers=admin).json() == {"synced": 1, "remaining": 0}
    ok = client.post(f"{url}/send", headers=admin, json={"confirm": True})
    assert ok.status_code == 200 and ok.json()["recipient_count"] == 1


def test_campaign_failure_is_recorded_and_retry_never_double_sends(client, resend, admin):  # noqa: F811
    _activate(client, resend, "a@example.org")
    campaign = _new_campaign(client, admin)
    url = f"/admin/newsletter/campaigns/{campaign['id']}"

    resend.fail[("POST", "/broadcasts/")] = ResendError(422, "segment has no contacts", "validation_error")
    failed = client.post(f"{url}/send", headers=admin, json={"confirm": True})
    assert failed.status_code == 502
    detail = client.get(url, headers=admin).json()
    assert detail["status"] == "failed" and "segment has no contacts" in detail["last_error"]

    # The send call timed out, but Resend actually queued it: the retry adopts that
    # result instead of creating a second broadcast.
    resend.fail.clear()
    resend.broadcast_status = "queued"
    retried = client.post(f"{url}/send", headers=admin, json={"confirm": True})
    assert retried.status_code == 200 and retried.json()["status"] == "sending"
    assert len([c for c in resend.calls if c[0] == "POST" and c[1] == "/broadcasts"]) == 1


def test_newsletter_draft_from_case_study(client, resend, admin):  # noqa: F811
    study = client.post("/admin/case-studies", headers=admin,
                        json={**STUDY, "cover_image_url": "https://example.org/cover.png"}).json()
    assert client.post(f"/admin/case-studies/{study['id']}/newsletter", headers=admin).status_code == 409  # draft
    client.post(f"/admin/case-studies/{study['id']}/publish", headers=admin)

    r = client.post(f"/admin/case-studies/{study['id']}/newsletter", headers=admin)
    assert r.status_code == 201, r.text
    campaign = client.get(f"/admin/newsletter/campaigns/{r.json()['campaign_id']}", headers=admin).json()
    assert campaign["status"] == "draft" and campaign["case_study_id"] == study["id"]
    assert campaign["subject"] == "New case study: AI Inventory Intelligence"
    for expected in ("# AI Inventory Intelligence", "![AI Inventory Intelligence](https://example.org/cover.png)",
                     STUDY["summary"], "- Stock alerts",
                     "[[button: Read the full case study | https://www.meetchetanpura.in/case-studies/ai-inventory-intelligence]]",
                     "https://www.meetchetanpura.in"):
        assert expected in campaign["content"]
    assert resend.calls == []  # a draft is prepared; nothing is sent


# ====================================================================================
# TEST F — Unsubscribe
# ====================================================================================
def test_unsubscribe_link_flow(client, resend, admin):  # noqa: F811
    _activate(client, resend, "bye@example.org")
    token = _unsub_token("bye@example.org")

    # Opening the link (GET) only looks it up — mail scanners must not unsubscribe people.
    info = client.get("/newsletter/unsubscribe", params={"token": token})
    assert info.status_code == 200 and info.json() == {"email": "b***@example.org", "status": "subscribed"}
    assert _row("bye@example.org").status == "active"

    done = client.post("/newsletter/unsubscribe", params={"token": token})
    assert done.status_code == 200 and done.json()["status"] == "unsubscribed" and done.json()["already"] is False
    row = _row("bye@example.org")
    assert row.status == "unsubscribed" and row.unsubscribed_at is not None and row.unsubscribe_source == "link"
    # Provider synchronisation.
    method, path, body = resend.of("PATCH", "/contacts/")[-1]
    assert path == f"/contacts/{row.resend_contact_id}" and body == {"unsubscribed": True}
    assert row.resend_sync_pending is False

    # Repeated unsubscribe is harmless.
    again = client.post("/newsletter/unsubscribe", params={"token": token})
    assert again.status_code == 200 and again.json()["already"] is True
    assert client.get("/newsletter/unsubscribe", params={"token": token}).json()["status"] == "unsubscribed"

    # Suppressed from future campaigns.
    campaign = _new_campaign(client, admin)
    preview = client.post(f"/admin/newsletter/campaigns/{campaign['id']}/preview", headers=admin).json()
    assert preview["eligible_recipients"] == 0
    assert client.post(f"/admin/newsletter/campaigns/{campaign['id']}/send", headers=admin,
                       json={"confirm": True}).status_code == 400


def test_unsubscribe_invalid_tokens(client, resend):  # noqa: F811
    _activate(client, resend, "safe@example.org")
    good = _unsub_token("safe@example.org")
    subscriber_id = good.split(".")[0]
    for bad in ("nonsense", f"{subscriber_id}.AAAA", f"999999.{good.split('.')[1]}", good[:-2] + "xx"):
        assert client.get("/newsletter/unsubscribe", params={"token": bad}).status_code == 400, bad
        assert client.post("/newsletter/unsubscribe", params={"token": bad}).status_code == 400, bad
    assert _row("safe@example.org").status == "active"


def test_resubscribing_needs_fresh_consent_and_confirmation(client, resend):  # noqa: F811
    _activate(client, resend, "back@example.org")
    client.post("/newsletter/unsubscribe", params={"token": _unsub_token("back@example.org")})
    first_unsubscribed_at = _row("back@example.org").unsubscribed_at

    before = len(resend.emails)
    assert _subscribe(client, "back@example.org").status_code == 201
    row = _row("back@example.org")
    assert row.status == "pending"  # not active again until the new link is confirmed
    assert row.unsubscribed_at == first_unsubscribed_at  # history preserved
    client.post("/newsletter/confirm", json={"token": _token_from(resend.emails[before])})
    row = _row("back@example.org")
    assert row.status == "active" and row.unsubscribed_at == first_unsubscribed_at
    assert resend.of("PATCH", "/contacts/")[-1][2] == {"unsubscribed": False}


# ====================================================================================
# TEST G — Webhooks + analytics
# ====================================================================================
def _webhook(client, payload, *, msg_id="msg_1", secret=WEBHOOK_SECRET, timestamp=None, tamper=False):  # noqa: F811
    body = json.dumps(payload).encode()
    timestamp = str(int(timestamp or time.time()))
    key = base64.b64decode(secret.removeprefix("whsec_"))
    signature = base64.b64encode(hmac.new(key, f"{msg_id}.{timestamp}.".encode() + body, hashlib.sha256).digest()).decode()
    if tamper:
        body = body.replace(b"email.", b"EMAIL.")
    return client.post("/webhooks/resend", content=body, headers={
        "svix-id": msg_id, "svix-timestamp": timestamp, "svix-signature": f"v1,{signature}",
        "content-type": "application/json"})


def _event(kind, broadcast_id, email, email_id, **data):
    return {"type": kind, "created_at": "2026-11-12T10:00:00.000Z",
            "data": {"broadcast_id": broadcast_id, "email_id": email_id, "to": [email], **data}}


def _sent_campaign(client, resend, admin, emails):  # noqa: F811
    for email in emails:
        _activate(client, resend, email)
    campaign = _new_campaign(client, admin)
    r = client.post(f"/admin/newsletter/campaigns/{campaign['id']}/send", headers=admin, json={"confirm": True})
    assert r.status_code == 200, r.text
    db = SessionLocal()
    broadcast_id = db.get(NewsletterCampaign, campaign["id"]).resend_broadcast_id
    db.close()
    return campaign["id"], broadcast_id


def test_webhook_signature_is_enforced(client, resend, monkeypatch):  # noqa: F811
    event = _event("email.delivered", "bc-x", "x@example.org", "e1")
    assert _webhook(client, event, secret="whsec_" + base64.b64encode(b"wrong-key").decode()).status_code == 401
    assert _webhook(client, event, tamper=True).status_code == 401  # body changed after signing
    assert _webhook(client, event, timestamp=time.time() - 3600).status_code == 401  # replay
    assert client.post("/webhooks/resend", json=event).status_code == 401  # unsigned
    db = SessionLocal()
    assert db.query(NewsletterWebhookEvent).count() == 0
    db.close()

    assert _webhook(client, event).status_code == 200
    monkeypatch.setattr(get_settings(), "RESEND_WEBHOOK_SECRET", "")
    assert _webhook(client, event, msg_id="msg_2").status_code == 503  # nothing accepted unverified


def test_webhook_events_drive_campaign_analytics(client, resend, admin):  # noqa: F811
    empty = client.get("/admin/newsletter/analytics", headers=admin).json()
    assert empty["campaigns"] == [] and empty["totals"]["delivered"] is None

    campaign_id, bc = _sent_campaign(client, resend, admin, ["a@example.org", "b@example.org", "c@example.org"])
    before = client.get("/admin/newsletter/analytics", headers=admin).json()["campaigns"][0]
    # Accepted by the API is not "delivered": with no events, metrics are unknown, not zero.
    assert before["recipients"] == 3 and before["tracking_available"] is False
    assert before["delivered"] is None and before["delivery_rate"] is None

    events = [
        ("m1", _event("email.sent", bc, "a@example.org", "e-a")),
        ("m2", _event("email.sent", bc, "b@example.org", "e-b")),
        ("m3", _event("email.sent", bc, "c@example.org", "e-c")),
        ("m4", _event("email.delivered", bc, "a@example.org", "e-a")),
        ("m5", _event("email.delivered", bc, "b@example.org", "e-b")),
        ("m6", _event("email.opened", bc, "a@example.org", "e-a")),
        ("m7", _event("email.opened", bc, "a@example.org", "e-a")),  # same person opens twice
        ("m8", _event("email.clicked", bc, "a@example.org", "e-a")),
        ("m9", _event("email.bounced", bc, "c@example.org", "e-c", bounce={"type": "Permanent"})),
    ]
    for msg_id, event in events:
        assert _webhook(client, event, msg_id=msg_id).json() == {"status": "ok"}

    # Redelivery of the same webhook is acknowledged but not counted twice.
    assert _webhook(client, events[3][1], msg_id="m4").json() == {"status": "duplicate"}
    assert _webhook(client, events[7][1], msg_id="m8").json() == {"status": "duplicate"}

    report = client.get("/admin/newsletter/analytics", headers=admin).json()
    row = report["campaigns"][0]
    assert row["id"] == campaign_id and row["status"] == "sent" and row["tracking_available"] is True
    assert (row["recipients"], row["sent"], row["delivered"], row["bounced"]) == (3, 3, 2, 1)
    assert (row["opened"], row["clicked"], row["complained"]) == (1, 1, 0)  # unique per email
    assert row["delivery_rate"] == 66.7 and row["click_rate"] == 50.0 and row["open_rate"] == 50.0
    assert row["unsubscribes"] is None  # not attributable per campaign: reported as unavailable
    assert report["totals"]["delivered"] == 2 and report["webhook_configured"] is True
    assert report["last_webhook_at"] is not None

    # A hard bounce suppresses the address and tells Resend.
    bounced = _row("c@example.org")
    assert bounced.status == "suppressed" and bounced.unsubscribe_source == "bounced"
    detail = client.get(f"/admin/newsletter/subscribers/{_row('a@example.org').id}", headers=admin).json()
    assert {e["event_type"] for e in detail["recent_events"]} == {"sent", "delivered", "opened", "clicked"}


def test_webhook_complaint_and_provider_unsubscribe_sync(client, resend, admin):  # noqa: F811
    _, bc = _sent_campaign(client, resend, admin, ["angry@example.org", "quiet@example.org", "temp@example.org"])

    _webhook(client, _event("email.complained", bc, "angry@example.org", "e1"), msg_id="c1")
    assert _row("angry@example.org").status == "suppressed"

    _webhook(client, _event("email.bounced", bc, "temp@example.org", "e3", bounce={"type": "Transient"}), msg_id="c3")
    assert _row("temp@example.org").status == "active"  # soft bounce: keep

    # Unsubscribed through Resend's own link → mirrored into the database.
    _webhook(client, {"type": "contact.updated", "created_at": "2026-11-12T10:00:00.000Z",
                      "data": {"id": "contact-1", "email": "quiet@example.org", "unsubscribed": True}}, msg_id="c2")
    row = _row("quiet@example.org")
    assert row.status == "unsubscribed" and row.unsubscribe_source == "resend" and row.resend_sync_pending is False

    # Resend can never re-activate someone: a "subscribed" contact event is not consent.
    _webhook(client, {"type": "contact.updated", "created_at": "2026-11-12T10:05:00.000Z",
                      "data": {"id": "contact-1", "email": "quiet@example.org", "unsubscribed": False}}, msg_id="c4")
    row = _row("quiet@example.org")
    assert row.status == "unsubscribed" and row.resend_sync_pending is True

    overview = client.get("/admin/newsletter/overview", headers=admin).json()
    assert overview["subscribers"] == {"pending": 0, "active": 1, "unsubscribed": 1, "suppressed": 1, "total": 3}
    assert overview["campaigns"]["total"] == 1 and overview["case_studies"] == {"published": 0, "draft": 0}


# ====================================================================================
# Renderer + settings
# ====================================================================================
def test_markdown_renderer_is_safe():
    html = render_markdown(
        '<b onclick="x()">hi</b> **bold** *it* `co<de`\n\n[x](javascript:alert(1)) [y](data:text/html,1) '
        '[ok](https://a.example/?q=1&r=2)\n\n![i](javascript:alert(1))\n\n[[button: Go | vbscript:x]]\n\n'
        '```\n<script>1</script>\n```', mode="email")
    assert "<b " not in html and "onclick=&quot;" in html
    assert "<strong>bold</strong>" in html and "<em>it</em>" in html and "co&lt;de" in html
    assert "javascript:" not in html and "vbscript:" not in html and "data:text" not in html
    assert 'href="https://a.example/?q=1&amp;r=2"' in html
    assert "<script>" not in html and "&lt;script&gt;" in html
    assert "<img" not in html


def test_settings_endpoint_never_returns_secrets(client, resend, admin):  # noqa: F811
    r = client.get("/admin/newsletter/settings", headers=admin)
    assert r.status_code == 200
    data = r.json()
    assert data["resend_configured"] and data["segment_configured"] and data["webhook_secret_configured"]
    assert data["sender"] == "Meet Chetanpura <hello@meetchetanpura.in>"
    assert "re_test_key" not in r.text and WEBHOOK_SECRET not in r.text and SEGMENT not in r.text


# --- Security regressions -------------------------------------------------------------
# (Production-secret enforcement is covered in tests/test_production_secrets.py.)
def test_unsubscribe_can_defer_commit_to_caller():
    db = SessionLocal()
    try:
        sub = NewsletterSubscriber(email="defer-commit@example.org", status="active", consent_given=True)
        db.add(sub)
        db.commit()
        assert svc.unsubscribe(db, sub, source="bounced", status="suppressed", commit=False)
        db.rollback()  # caller's transaction fails → nothing is persisted
        db.refresh(sub)
        assert sub.status == "active"
    finally:
        db.query(NewsletterSubscriber).filter_by(email="defer-commit@example.org").delete()
        db.commit()
        db.close()
