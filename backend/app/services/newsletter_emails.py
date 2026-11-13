"""
Newsletter email templates (confirmation, welcome, campaign shell) and their senders.

Templates are table-based with inline styles and a single 600px column, so they render
consistently in Gmail, Outlook and Apple Mail and collapse cleanly on phones.
"""

import html
import logging

from app.core.config import Settings
from app.services import resend_client
from app.services.email_delivery import _resend_sender
from app.services.markdown_renderer import UNSUBSCRIBE_PLACEHOLDER

logger = logging.getLogger(__name__)

WELCOME_SUBJECT = "Welcome to My AI & Technology Newsletter!"
CONFIRM_SUBJECT = "Confirm your subscription to Meet Chetanpura's newsletter"

WELCOME_TOPICS = [
    "Agentic AI",
    "Artificial Intelligence",
    "Generative AI",
    "Large Language Models",
    "Machine Learning",
    "RAG and AI Agents",
    "Workflow Automation",
    "Real-world software engineering",
]

_P = "margin:0 0 16px;font-size:16px;line-height:1.65;color:#334155;"
_BTN = ("display:inline-block;padding:13px 24px;background:#2563eb;color:#ffffff;text-decoration:none;"
        "border-radius:10px;font-size:15px;font-weight:600;")
_FOOT = "margin:0 0 6px;font-size:12px;line-height:1.6;color:#64748b;"
_FOOT_LINK = "color:#64748b;text-decoration:underline;"


def newsletter_sender(settings: Settings) -> str:
    return f"{settings.NEWSLETTER_FROM_NAME} <{_resend_sender(settings)}>"


def email_shell(settings: Settings, body_html: str, footer_html: str, preheader: str = "") -> str:
    """Wrap body HTML in the shared responsive layout."""
    site = html.escape(settings.app_base_url, quote=True)
    name = html.escape(settings.NEWSLETTER_FROM_NAME)
    hidden = (
        f'<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">'
        f"{html.escape(preheader)}</div>" if preheader else ""
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>{name}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
{hidden}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
        <tr>
          <td style="padding:4px 8px 16px;">
            <a href="{site}" style="font-size:17px;font-weight:700;color:#0b1530;text-decoration:none;">{name}</a>
            <span style="font-size:13px;color:#64748b;">&nbsp;·&nbsp;AI &amp; Technology Newsletter</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px 28px;">
            {body_html}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 8px 8px;">
            {footer_html}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>"""


def _postal_line(settings: Settings) -> str:
    address = (settings.NEWSLETTER_POSTAL_ADDRESS or "").strip()
    return f'<p style="{_FOOT}">{html.escape(address)}</p>' if address else ""


def confirmation_email_html(settings: Settings, confirm_url: str) -> str:
    url = html.escape(confirm_url, quote=True)
    hours = settings.NEWSLETTER_CONFIRMATION_HOURS
    body = f"""
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#0b1530;">Confirm your subscription</h1>
<p style="{_P}">Hello,</p>
<p style="{_P}">Please confirm that you want to receive my AI &amp; technology newsletter at this address.</p>
<p style="margin:8px 0 24px;"><a href="{url}" style="{_BTN}">Confirm subscription</a></p>
<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#64748b;">Or copy this link into your browser:</p>
<p style="margin:0 0 20px;font-size:13px;line-height:1.6;word-break:break-all;"><a href="{url}" style="color:#2563eb;">{url}</a></p>
<p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">This link expires in {hours} hours. If you did not ask to subscribe, ignore this email — you will not be added to the list.</p>
"""
    footer = (
        f'<p style="{_FOOT}">You are receiving this one-time email because this address was entered in the '
        f'newsletter form on <a href="{html.escape(settings.app_base_url, quote=True)}" style="{_FOOT_LINK}">'
        f"{html.escape(settings.app_base_url.split('://')[-1])}</a>.</p>" + _postal_line(settings)
    )
    return email_shell(settings, body, footer, "One click to confirm your subscription.")


def welcome_email_html(settings: Settings, unsubscribe_url: str) -> str:
    site = html.escape(settings.app_base_url, quote=True)
    topics = "".join(f'<li style="margin:0 0 6px;">{html.escape(t)}</li>' for t in WELCOME_TOPICS)
    body = f"""
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#0b1530;">Welcome aboard!</h1>
<p style="{_P}">Hello,</p>
<p style="{_P}">Thank you for joining my newsletter!</p>
<p style="{_P}">I'm excited to share my latest work, technical experiments, and practical learning in:</p>
<ul style="margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.65;color:#334155;">{topics}</ul>
<p style="{_P}">You will receive occasional updates about my latest projects, technical case studies, and tutorials.</p>
<p style="margin:8px 0 24px;"><a href="{site}" style="{_BTN}">Explore my portfolio</a></p>
<p style="margin:0 0 4px;font-size:16px;line-height:1.65;color:#334155;">Best regards,</p>
<p style="margin:0;font-size:16px;line-height:1.65;color:#0b1530;font-weight:600;">Meet Chetanpura</p>
"""
    footer = (
        f'<p style="{_FOOT}">You are receiving this email because you confirmed your subscription on '
        f'<a href="{site}" style="{_FOOT_LINK}">{html.escape(settings.app_base_url.split("://")[-1])}</a>.</p>'
        f'<p style="{_FOOT}"><a href="{html.escape(unsubscribe_url, quote=True)}" style="{_FOOT_LINK}">Unsubscribe</a>'
        f" at any time.</p>" + _postal_line(settings)
    )
    return email_shell(settings, body, footer, "Thanks for joining — here is what to expect.")


def campaign_email_html(settings: Settings, body_html: str, preheader: str = "") -> str:
    """Campaign layout. The unsubscribe link is part of the shell, so no campaign can ship without one."""
    site = html.escape(settings.app_base_url, quote=True)
    footer = (
        f'<p style="{_FOOT}">You are receiving this email because you subscribed to the newsletter on '
        f'<a href="{site}" style="{_FOOT_LINK}">{html.escape(settings.app_base_url.split("://")[-1])}</a>.</p>'
        f'<p style="{_FOOT}"><a href="{UNSUBSCRIBE_PLACEHOLDER}" style="{_FOOT_LINK}">Unsubscribe</a>'
        f" from future emails.</p>" + _postal_line(settings)
    )
    return email_shell(settings, body_html, footer, preheader)


# --- Senders ----------------------------------------------------------------------
def send_confirmation_email(settings: Settings, to: str, confirm_url: str) -> str:
    return resend_client.send_email({
        "from": newsletter_sender(settings),
        "to": [to],
        "subject": CONFIRM_SUBJECT,
        "html": confirmation_email_html(settings, confirm_url),
        "reply_to": settings.ADMIN_EMAIL,
        "tags": [{"name": "category", "value": "newsletter_confirm"}],
    })


def send_welcome_email(settings: Settings, to: str, subscriber_id: int,
                       unsubscribe_url: str, one_click_url: str) -> str:
    return resend_client.send_email(
        {
            "from": newsletter_sender(settings),
            "to": [to],
            "subject": WELCOME_SUBJECT,
            "html": welcome_email_html(settings, unsubscribe_url),
            "reply_to": settings.ADMIN_EMAIL,
            # RFC 8058 one-click unsubscribe for mailbox providers.
            "headers": {
                "List-Unsubscribe": f"<{one_click_url}>",
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
            "tags": [{"name": "category", "value": "newsletter_welcome"}],
        },
        idempotency_key=f"newsletter-welcome-{subscriber_id}",
    )
