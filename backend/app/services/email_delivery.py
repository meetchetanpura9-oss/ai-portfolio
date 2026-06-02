import html
import logging
import urllib.request
import urllib.parse
import json
from app.core.config import Settings
from app.models.contact_model import Contact
from app.services.email_service import send_contact_emails # Fallback to existing SMTP

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
              <a href="https://wa.me/919998471715" style="color:#38bdf8;text-decoration:none;">Chat on WhatsApp</a> | 
              <a href="https://github.com/meetchetanpura9-oss" style="color:#38bdf8;text-decoration:none;">GitHub</a>
            </p>
          </div>
        </div>
      </body>
    </html>
    """

async def deliver_contact_emails(contact_id: int) -> None:
    """Send admin alert and client confirmation. Uses Resend API if key is present, otherwise SMTP."""
    from app.database.connection import SessionLocal
    from app.models.contact_model import Contact
    from app.core.config import get_settings

    settings = get_settings()
    db = SessionLocal()
    try:
        c = db.query(Contact).filter(Contact.id == contact_id).first()
        if not c:
            logger.error(f"Contact ID {contact_id} not found for email delivery")
            return

        sent_successfully = False
        error_msg = None

        # 1. Try Resend API if configured
        if settings.RESEND_API_KEY and settings.RESEND_API_KEY.startswith("re_"):
            logger.info("Delivering contact notifications via Resend API...")
            try:
                url = "https://api.resend.com/emails"
                headers = {
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                # Resend free tier requires sending from onboarding@resend.dev if domain not verified
                sender = settings.MAIL_FROM if (settings.MAIL_FROM and "@" in settings.MAIL_FROM) else "onboarding@resend.dev"
                
                # Send Admin Notification
                admin_payload = {
                    "from": f"{settings.MAIL_FROM_NAME} <{sender}>",
                    "to": [settings.ADMIN_EMAIL],
                    "subject": f"💼 New Connection: {c.full_name} ({c.service})",
                    "html": _admin_html_template(c, settings)
                }
                
                # Send Client Auto-Reply
                client_payload = {
                    "from": f"{settings.MAIL_FROM_NAME} <{sender}>",
                    "to": [c.email],
                    "subject": "Thanks for connecting with me!",
                    "html": _client_html_template(c, settings)
                }
                
                for payload in [admin_payload, client_payload]:
                    req = urllib.request.Request(
                        url, 
                        data=json.dumps(payload).encode("utf-8"), 
                        headers=headers,
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=10) as response:
                        res_body = response.read().decode("utf-8")
                        logger.debug(f"Resend API Response: {res_body}")
                
                logger.info(f"Emails sent successfully via Resend for contact id={c.id}")
                sent_successfully = True
            except Exception as exc:
                logger.exception(f"Resend API delivery failed: {exc}")
                error_msg = f"Resend API error: {str(exc)}"
                
        # 2. Fallback to standard SMTP
        if not sent_successfully:
            logger.info("Delivering contact notifications via SMTP...")
            try:
                await send_contact_emails(c, settings)
                logger.info(f"Emails sent successfully via SMTP for contact id={c.id}")
                sent_successfully = True
                error_msg = None
            except Exception as smtp_exc:
                logger.exception(f"SMTP delivery failed: {smtp_exc}")
                error_msg = f"SMTP error: {str(smtp_exc)}" if error_msg is None else f"{error_msg} | SMTP error: {str(smtp_exc)}"

        # 3. Update status in PostgreSQL database
        if sent_successfully:
            c.notification_status = "sent"
            c.notification_error = None
        else:
            c.notification_status = "failed"
            c.notification_error = error_msg
            
        db.commit()
    except Exception as db_err:
        logger.exception(f"Error handling email delivery database session: {db_err}")
        try:
            db.rollback()
        except:
            pass
    finally:
        db.close()
