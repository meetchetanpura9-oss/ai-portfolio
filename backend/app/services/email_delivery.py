"""
Contact-form email notifications: owner alert (required) + visitor auto-reply (best effort).

Resend's HTTPS API is tried first because Render's free plan blocks outbound SMTP;
Gmail/SMTP is the fallback for hosts that allow it.
"""

import html
import json
import logging
import urllib.error
import urllib.request

from app.core.config import Settings
from app.models.contact_model import Contact

logger = logging.getLogger(__name__)

def _admin_html_template(c: Contact, settings: Settings) -> str:
    company = c.company or "Not specified"
    msg_escaped = html.escape(c.message).replace("\n", "<br>")
    
    return f"""
    <html>
      <body style="margin:0;font-family:'Segoe UI',sans-serif;background:#050816;color:#e2e8f0;padding:32px;">
        <div style="max-width:600px;margin:0 auto;background:#0c1021;border:1px solid #1e293b;border-radius:16px;padding:36px;box-shadow:0 12px 40px rgba(0,0,0,0.5);">
          <div style="border-bottom:1px solid #1e293b;padding-bottom:20px;margin-bottom:24px;">
            <p style="color:#a78bfa;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">New Submission</p>
            <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">{html.escape(c.full_name)}</h1>
            <p style="color:#64748b;font-size:13px;margin:6px 0 0;">Wants to collaborate from <strong>{html.escape(c.country or "Unknown")}</strong></p>
          </div>
          
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;">
            <tr style="border-bottom:1px solid #151c33;"><td style="padding:12px 0;color:#64748b;width:120px;">Email</td><td style="padding:12px 0;color:#ffffff;font-weight:500;"><a href="mailto:{html.escape(c.email)}" style="color:#38bdf8;text-decoration:none;">{html.escape(c.email)}</a></td></tr>
            <tr style="border-bottom:1px solid #151c33;"><td style="padding:12px 0;color:#64748b;">Phone</td><td style="padding:12px 0;color:#ffffff;font-weight:500;">{html.escape(c.phone)}</td></tr>
            <tr style="border-bottom:1px solid #151c33;"><td style="padding:12px 0;color:#64748b;">Company</td><td style="padding:12px 0;color:#ffffff;font-weight:500;">{html.escape(company)}</td></tr>
            <tr style="border-bottom:1px solid #151c33;"><td style="padding:12px 0;color:#64748b;">Service</td><td style="padding:12px 0;color:#c084fc;font-weight:bold;">{html.escape(c.service)}</td></tr>
          </table>
          
          <div style="background:#050816;border:1px solid #1e293b;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="color:#64748b;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Message Content</p>
            <p style="margin:0;line-height:1.6;color:#cbd5e1;font-size:14px;white-space:pre-wrap;">{msg_escaped}</p>
          </div>
          
          <div style="color:#475569;font-size:11px;text-align:center;border-top:1px solid #1e293b;padding-top:16px;">
            <p style="margin:0;">IP Address: {html.escape(c.ip_address or "Unknown")} | Site: {html.escape(settings.SITE_NAME)}</p>
          </div>
        </div>
      </body>
    </html>
    """

def _client_html_template(c: Contact, settings: Settings) -> str:
    return f"""
    <html>
      <body style="margin:0;font-family:'Segoe UI',sans-serif;background:#050816;color:#e2e8f0;padding:32px;">
        <div style="max-width:560px;margin:0 auto;background:#0c1021;border:1px solid #1e293b;border-radius:16px;padding:36px;box-shadow:0 12px 40px rgba(0,0,0,0.4);">
          <h2 style="color:#a78bfa;margin:0 0 16px;font-size:22px;font-weight:700;">Thanks for filling out this form!</h2>
          <p style="line-height:1.7;color:#cbd5e1;font-size:15px;margin:0 0 16px;">
            We are connecting with you shortly. I have received your request for <strong>{html.escape(c.service)}</strong>. It is saved in my tracking dashboard and I will get back to you soon.
          </p>
          <p style="line-height:1.7;color:#94a3b8;font-size:14px;margin:0 0 28px;">
            Typically, I respond within 24 to 48 hours. Let's build something intelligent together!
          </p>
          
          <div style="border-top:1px solid #1e293b;padding-top:20px;color:#64748b;font-size:13px;">
            <p style="margin:0;line-height:1.5;">
              <strong>Chetanpura Meet</strong><br>
              AI & Automation Engineer<br>
              <a href="https://github.com/meetchetanpura9-oss" style="color:#38bdf8;text-decoration:none;">GitHub</a>
            </p>
          </div>
        </div>
      </body>
    </html>
    """


RESEND_URL = "https://api.resend.com/emails"
RESEND_SHARED_SENDER = "onboarding@resend.dev"
# Resend only sends from domains you have verified, so a personal mailbox address can
# never be the sender — using one makes every send fail with a 403.
_PUBLIC_MAIL_DOMAINS = {
    "gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "live.com", "icloud.com", "proton.me", "protonmail.com", "example.com",
}


def _resend_sender(settings: Settings) -> str:
    """Pick a sender Resend will accept: RESEND_FROM, else MAIL_FROM on a custom domain, else the shared sender."""
    for candidate in (settings.RESEND_FROM, settings.MAIL_FROM):
        addr = (candidate or "").strip()
        if "@" in addr and addr.rsplit("@", 1)[1].lower() not in _PUBLIC_MAIL_DOMAINS:
            return addr
    return RESEND_SHARED_SENDER


def _resend_send(settings: Settings, payload: dict) -> str:
    """POST one email to Resend. Returns the Resend message id; raises with Resend's own error text."""
    req = urllib.request.Request(
        RESEND_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY.strip()}",
            "Content-Type": "application/json",
            # Resend sits behind Cloudflare, which can reject Python's default urllib User-Agent.
            "User-Agent": "ai-portfolio-backend/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            body = json.loads(response.read().decode("utf-8") or "{}")
            return str(body.get("id", ""))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"Resend HTTP {exc.code}: {detail}") from exc


def _resend_payload(settings: Settings, to: str, subject: str, html_body: str, reply_to: str | None = None) -> dict:
    payload = {
        "from": f"{settings.MAIL_FROM_NAME} <{_resend_sender(settings)}>",
        "to": [to],
        "subject": subject,
        "html": html_body,
    }
    if reply_to:
        payload["reply_to"] = reply_to
    return payload


async def send_emails_for(c: Contact, settings: Settings) -> tuple[bool, str | None]:
    """
    Send the owner alert (required) and the visitor auto-reply (best effort).

    Returns (alert_delivered, note). Resend is tried first because it uses HTTPS;
    SMTP is the fallback (blocked on Render's free plan). A failed auto-reply never
    marks the submission as failed — the owner alert is what matters.
    """
    from app.services.email_service import send_admin_alert_smtp, send_client_reply_smtp

    errors: list[str] = []
    provider = None

    # 1. Owner alert
    if settings.resend_enabled:
        try:
            msg_id = _resend_send(settings, _resend_payload(
                settings,
                settings.ADMIN_EMAIL,
                f"💼 New inquiry: {c.full_name} ({c.service})",
                _admin_html_template(c, settings),
                reply_to=c.email,
            ))
            provider = "resend"
            logger.info("Owner alert sent via Resend (id=%s) for contact %s", msg_id, c.id)
        except Exception as exc:
            logger.error("Owner alert via Resend failed: %s", exc)
            errors.append(f"Resend: {exc}")

    if provider is None and settings.mail_enabled:
        try:
            await send_admin_alert_smtp(c, settings)
            provider = "smtp"
            logger.info("Owner alert sent via SMTP for contact %s", c.id)
        except Exception as exc:
            logger.error("Owner alert via SMTP failed: %s", exc)
            errors.append(f"SMTP: {exc}")

    if provider is None:
        if not errors:
            errors.append("No email provider configured — set RESEND_API_KEY (recommended on Render) "
                          "or MAIL_SERVER/MAIL_USERNAME/MAIL_PASSWORD")
        return False, " | ".join(errors)[:2000]

    # 2. Visitor auto-reply (best effort, same provider that just worked)
    try:
        if provider == "resend":
            _resend_send(settings, _resend_payload(
                settings, c.email, "Thanks for connecting with me!", _client_html_template(c, settings),
                reply_to=settings.ADMIN_EMAIL,
            ))
        else:
            await send_client_reply_smtp(c, settings)
    except Exception as exc:
        # Expected with Resend's shared sender until a domain is verified.
        logger.warning("Visitor auto-reply not sent: %s", exc)
        return True, f"Owner alert sent via {provider}; visitor auto-reply not sent: {exc}"[:2000]

    return True, None


def email_provider_status(settings: Settings) -> dict:
    """Non-secret summary of the email configuration, for the admin diagnostics endpoint."""
    return {
        "admin_email": settings.ADMIN_EMAIL,
        "resend_configured": settings.resend_enabled,
        "resend_sender": _resend_sender(settings) if settings.resend_enabled else None,
        "smtp_configured": settings.mail_enabled,
        "smtp_server": settings.MAIL_SERVER or None,
    }


async def send_test_alert(settings: Settings) -> tuple[bool, str | None]:
    """Send a sample owner alert to ADMIN_EMAIL (no visitor email, nothing saved)."""
    sample = Contact(
        id=0,
        full_name="Test Notification",
        email=settings.ADMIN_EMAIL,
        phone="+00 0000000000",
        company="Portfolio diagnostics",
        service="Email delivery test",
        message="This is a test alert from your portfolio backend. If you can read it, "
                "contact-form notifications are working.",
        ip_address="-",
        country="-",
    )
    errors: list[str] = []
    if settings.resend_enabled:
        try:
            _resend_send(settings, _resend_payload(
                settings, settings.ADMIN_EMAIL, "✅ Portfolio email test", _admin_html_template(sample, settings)))
            return True, "Sent via Resend"
        except Exception as exc:
            errors.append(f"Resend: {exc}")
    if settings.mail_enabled:
        from app.services.email_service import send_admin_alert_smtp
        try:
            await send_admin_alert_smtp(sample, settings)
            return True, "Sent via SMTP"
        except Exception as exc:
            errors.append(f"SMTP: {exc}")
    return False, " | ".join(errors) or "No email provider configured"


async def deliver_contact_emails(contact_id: int) -> None:
    """Background task: load the saved contact, send emails and record the delivery status."""
    from app.database.connection import SessionLocal
    from app.core.config import get_settings

    settings = get_settings()
    db = SessionLocal()
    try:
        c = db.query(Contact).filter(Contact.id == contact_id).first()
        if not c:
            logger.error(f"Contact ID {contact_id} not found for email delivery")
            return
        ok, note = await send_emails_for(c, settings)
        c.notification_status = "sent" if ok else "failed"
        c.notification_error = note
        db.commit()
    except Exception as db_err:
        logger.exception(f"Error handling email delivery database session: {db_err}")
        try:
            db.rollback()
        except Exception:
            pass
    finally:
        db.close()
