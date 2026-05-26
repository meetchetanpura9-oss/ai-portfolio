"""Build notification text with full inquiry details."""

from app.models.contact_model import Contact


def format_inquiry_details(contact: Contact) -> str:
    company = contact.company or "—"
    return (
        f"Name: {contact.full_name}\n"
        f"Email: {contact.email}\n"
        f"Phone: {contact.phone}\n"
        f"Company: {company}\n"
        f"Service: {contact.service}\n"
        f"Message: {contact.message}"
    )


def format_sms_body(contact: Contact) -> str:
    company = contact.company or "—"
    msg = contact.message[:120] + ("..." if len(contact.message) > 120 else "")
    return (
        f"New portfolio inquiry from {contact.full_name}. "
        f"Svc: {contact.service}. Ph: {contact.phone}. "
        f"Email: {contact.email}. Co: {company}. Msg: {msg}"
    )[:1600]


def format_whatsapp_body(contact: Contact) -> str:
    company = contact.company or "—"
    return (
        f"New portfolio inquiry received from {contact.full_name}\n\n"
        f"Email: {contact.email}\n"
        f"Phone: {contact.phone}\n"
        f"Company: {company}\n"
        f"Service: {contact.service}\n\n"
        f"Message:\n{contact.message}"
    )
