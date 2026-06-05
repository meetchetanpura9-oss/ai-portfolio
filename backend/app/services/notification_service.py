"""
Twilio SMS notifications to admin on new contact submissions.
Optional — only runs when Twilio credentials are configured.
"""

import logging

from app.core.config import Settings
from app.models.contact_model import Contact
from app.services.contact_notify import format_sms_body

logger = logging.getLogger(__name__)


def _twilio_client(settings: Settings):
    from twilio.rest import Client

    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


def send_sms_notification(contact: Contact, settings: Settings) -> None:
    if not settings.twilio_enabled:
        logger.warning("Twilio SMS not configured — skipping SMS")
        return

    client = _twilio_client(settings)
    client.messages.create(
        body=format_sms_body(contact),
        from_=settings.TWILIO_SMS_FROM,
        to=settings.ADMIN_PHONE_SMS,
    )
    logger.info("SMS notification sent for contact id=%s", contact.id)


def send_all_notifications(contact: Contact, settings: Settings) -> None:
    """Fire SMS; failures are logged but do not fail the API."""
    try:
        send_sms_notification(contact, settings)
    except Exception as exc:
        logger.exception("SMS notification failed: %s", exc)

