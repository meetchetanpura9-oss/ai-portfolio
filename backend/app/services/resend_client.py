"""
Thin Resend REST client (https://resend.com/docs/api-reference).

Uses the same urllib-over-HTTPS approach as email_delivery.py, so it works on hosts
that block SMTP and needs no extra dependency. Only documented endpoints are called:

    POST   /emails                                   single transactional email
    POST   /contacts                                 create contact (optionally in segments)
    PATCH  /contacts/{id|email}                      update subscription status
    POST   /contacts/{id|email}/segments/{segment}   add contact to a segment
    POST   /broadcasts                               create a broadcast (draft)
    GET    /broadcasts/{id}                          read status
    POST   /broadcasts/{id}/send                     send now, or schedule with scheduled_at
    DELETE /broadcasts/{id}                          delete a draft / cancel a scheduled send

The API key never leaves the server and is never logged.
"""

import json
import logging
import urllib.error
import urllib.parse
import urllib.request

from app.core.config import get_settings

logger = logging.getLogger(__name__)

RESEND_API = "https://api.resend.com"


class ResendError(RuntimeError):
    """A Resend call failed. `status` is None when no HTTP response was received
    (timeout / network error) — in that case the outcome of the call is unknown."""

    def __init__(self, status: int | None, detail: str, name: str = ""):
        super().__init__(f"Resend {'HTTP ' + str(status) if status else 'network error'}: {detail}")
        self.status = status
        self.detail = detail
        self.name = name

    @property
    def outcome_unknown(self) -> bool:
        return self.status is None or self.status >= 500


def resend_request(method: str, path: str, body: dict | None = None,
                   idempotency_key: str | None = None, timeout: int = 20) -> dict:
    settings = get_settings()
    if not settings.resend_enabled:
        raise ResendError(400, "RESEND_API_KEY is not configured", "not_configured")

    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
        "Content-Type": "application/json",
        # Resend sits behind Cloudflare, which can reject Python's default urllib User-Agent.
        "User-Agent": "ai-portfolio-backend/1.0",
    }
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key[:256]

    req = urllib.request.Request(
        RESEND_API + path,
        data=json.dumps(body).encode("utf-8") if body is not None else None,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8") or "{}"
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")[:500]
        name, message = "", raw
        try:
            parsed = json.loads(raw)
            name = str(parsed.get("name", ""))
            message = str(parsed.get("message", raw))
        except ValueError:
            pass
        raise ResendError(exc.code, message, name) from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise ResendError(None, type(exc).__name__) from exc


def _q(value: str) -> str:
    return urllib.parse.quote(value, safe="@")


# --- Emails ---------------------------------------------------------------------
def send_email(payload: dict, idempotency_key: str | None = None) -> str:
    return str(resend_request("POST", "/emails", payload, idempotency_key).get("id", ""))


# --- Contacts -------------------------------------------------------------------
def create_contact(email: str, first_name: str | None, segment_id: str | None) -> str:
    body: dict = {"email": email, "unsubscribed": False}
    if first_name:
        body["first_name"] = first_name
    if segment_id:
        body["segments"] = [{"id": segment_id}]
    return str(resend_request("POST", "/contacts", body).get("id", ""))


def update_contact(id_or_email: str, *, unsubscribed: bool) -> str:
    return str(resend_request("PATCH", f"/contacts/{_q(id_or_email)}", {"unsubscribed": unsubscribed}).get("id", ""))


def add_contact_to_segment(id_or_email: str, segment_id: str) -> None:
    resend_request("POST", f"/contacts/{_q(id_or_email)}/segments/{_q(segment_id)}")


# --- Broadcasts -----------------------------------------------------------------
def create_broadcast(*, segment_id: str, sender: str, subject: str, html: str,
                     name: str, reply_to: str | None = None) -> str:
    body = {"segment_id": segment_id, "from": sender, "subject": subject, "html": html, "name": name}
    if reply_to:
        body["reply_to"] = reply_to
    return str(resend_request("POST", "/broadcasts", body).get("id", ""))


def get_broadcast(broadcast_id: str) -> dict:
    return resend_request("GET", f"/broadcasts/{_q(broadcast_id)}")


def send_broadcast(broadcast_id: str, scheduled_at: str | None = None) -> None:
    resend_request("POST", f"/broadcasts/{_q(broadcast_id)}/send",
                   {"scheduled_at": scheduled_at} if scheduled_at else {})


def delete_broadcast(broadcast_id: str) -> None:
    resend_request("DELETE", f"/broadcasts/{_q(broadcast_id)}")
