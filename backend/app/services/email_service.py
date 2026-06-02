"""
Email notifications via FastAPI-Mail (SMTP).
Gracefully skips when SMTP is not configured.
"""

import html
import logging

from app.core.config import Settings
from app.models.contact_model import Contact

logger = logging.getLogger(__name__)


def _mail_config(settings: Settings):
    from fastapi_mail import ConnectionConfig

    return ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=False,
    )


def _admin_html(contact: Contact, settings: Settings) -> str:
    company = contact.company or "-"
    message = html.escape(contact.message).replace("\n", "<br>")

    return f"""
    <html>
      <body style="margin:0;font-family:Arial,sans-serif;background:#0A0A0F;color:#eee;padding:24px;">
        <div style="max-width:620px;margin:0 auto;background:#14141f;border:1px solid #333;border-radius:14px;padding:28px;">
          <p style="margin:0 0 8px;color:#34d399;font-size:13px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">
            New contact form submission
          </p>
          <h2 style="color:#fff;margin:0 0 10px;font-size:24px;">{html.escape(contact.full_name)} wants to connect</h2>
          <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 24px;">
            A visitor filled out the Contact Us form on {html.escape(settings.SITE_NAME)}.
          </p>

          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:10px 0;color:#888;width:120px;">Name</td><td style="padding:10px 0;color:#fff;"><strong>{html.escape(contact.full_name)}</strong></td></tr>
            <tr><td style="padding:10px 0;color:#888;">Email</td><td style="padding:10px 0;color:#fff;">{html.escape(contact.email)}</td></tr>
            <tr><td style="padding:10px 0;color:#888;">Phone</td><td style="padding:10px 0;color:#fff;">{html.escape(contact.phone)}</td></tr>
            <tr><td style="padding:10px 0;color:#888;">Company</td><td style="padding:10px 0;color:#fff;">{html.escape(company)}</td></tr>
            <tr><td style="padding:10px 0;color:#888;">Service</td><td style="padding:10px 0;color:#fff;">{html.escape(contact.service)}</td></tr>
          </table>

          <div style="margin-top:24px;padding:18px;background:#0A0A0F;border-radius:10px;border:1px solid #2a2a3a;">
            <p style="margin:0 0 10px;color:#a78bfa;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">Message</p>
            <p style="margin:0;line-height:1.7;color:#eee;">{message}</p>
          </div>

          <p style="margin:24px 0 0;font-size:12px;color:#666;">Submission ID: {contact.id}</p>
        </div>
      </body>
    </html>
    """


def _client_auto_reply_html(contact: Contact, settings: Settings) -> str:
    safe_message = html.escape(contact.message).replace("\n", "<br>")
    return f"""
    <html>
      <body style="margin:0;font-family:Arial,sans-serif;background:#0A0A0F;color:#eee;padding:24px;">
        <div style="max-width:560px;margin:0 auto;background:#14141f;border:1px solid #333;border-radius:14px;padding:28px;">
          <h2 style="color:#a78bfa;margin:0 0 16px;">Thanks for filling out this form!</h2>
          <p style="line-height:1.7;color:#ddd;font-size:15px;margin:0;">
            We are connecting with you shortly. Your message has been received successfully.
          </p>

          <div style="margin-top:18px;padding:18px;background:#0A0A0F;border-radius:12px;border:1px solid #2a2a3a;">
            <p style="margin:0 0 8px;color:#a78bfa;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;">Your submitted message</p>
            <p style="margin:0;line-height:1.7;color:#eee;white-space:pre-wrap;">{safe_message}</p>
          </div>

          <p style="line-height:1.7;color:#aaa;font-size:14px;margin:18px 0 0;">
            You do not need to submit the form again. We will reply to this email address as soon as possible.
          </p>
          <p style="color:#888;font-size:13px;margin-top:24px;">- {html.escape(settings.SITE_NAME)}</p>
        </div>
      </body>
    </html>
    """


async def send_contact_emails(contact: Contact, settings: Settings) -> None:
    if not settings.mail_enabled:
        logger.warning("SMTP not configured - skipping email notifications")
        return

    from fastapi_mail import FastMail, MessageSchema, MessageType

    fm = FastMail(_mail_config(settings))

    admin_message = MessageSchema(
        subject=f"New Contact Us form message from {contact.full_name}",
        recipients=[settings.ADMIN_EMAIL],
        body=_admin_html(contact, settings),
        subtype=MessageType.html,
    )

    client_message = MessageSchema(
        subject="Thank you for filling out the form",
        recipients=[contact.email],
        body=_client_auto_reply_html(contact, settings),
        subtype=MessageType.html,
    )

    await fm.send_message(admin_message)
    await fm.send_message(client_message)
    logger.info("Contact emails sent for submission id=%s", contact.id)
