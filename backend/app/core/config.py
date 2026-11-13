"""
Application settings loaded from environment variables.
Never commit real secrets — use .env locally and platform secrets in production.
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/ai_portfolio"
    )
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30

    # API / CORS
    ALLOWED_ORIGINS: str = "*"
    RATE_LIMIT_REQUESTS: int = 5
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # Admin & branding
    # Where new contact-form alerts are delivered.
    ADMIN_EMAIL: str = "meetchetanpura9@gmail.com"
    ADMIN_NAME: str = "Portfolio Admin"
    # Only used to create the very first admin account. No default: if unset,
    # no admin is auto-created. Never log or return this value.
    ADMIN_PASSWORD: str = ""
    SITE_NAME: str = "Chetanpura Meet — AI Portfolio"

    # SMTP (FastAPI-Mail)
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@example.com"
    MAIL_FROM_NAME: str = "AI Portfolio"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = ""
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    # Excel-compatible CSV log (opens in Microsoft Excel)
    CONTACT_CSV_PATH: str = "data/contact_submissions.csv"

    # Twilio (optional — leave empty if not used)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_SMS_FROM: str = ""
    ADMIN_PHONE_SMS: str = ""

    # WhatsApp alerts for new contact submissions — configure ONE provider.
    # A) CallMeBot (free, personal): https://www.callmebot.com/blog/free-api-whatsapp-messages/
    CALLMEBOT_PHONE: str = ""       # your WhatsApp number with country code, e.g. +919998471715
    CALLMEBOT_APIKEY: str = ""
    # B) Twilio WhatsApp (also needs TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN above)
    TWILIO_WHATSAPP_FROM: str = ""  # e.g. whatsapp:+14155238886 (sandbox) or an approved sender
    ADMIN_PHONE_WHATSAPP: str = ""  # e.g. whatsapp:+919998471715

    # Optional: protect GET /contact and /contact/export (set a long random string)
    ADMIN_API_KEY: str = ""
    
    # Resend (https://resend.com) — sends over HTTPS, so it works on hosts that block SMTP
    # (Render's free plan does). Leave RESEND_FROM empty to use Resend's shared sender
    # onboarding@resend.dev, which can only deliver to the email your Resend account was
    # created with. After verifying your own domain in Resend, set e.g.
    # RESEND_FROM=hello@meetchetanpura.in so auto-replies reach visitors too.
    RESEND_API_KEY: str = ""
    RESEND_FROM: str = ""

    # --- Newsletter & case studies -------------------------------------------------
    # Public site URL used for links inside emails (confirm, unsubscribe, case studies).
    APP_BASE_URL: str = "https://www.meetchetanpura.in"
    # Public URL of this API, used for uploaded-image URLs. Empty = derive from the request.
    API_BASE_URL: str = ""
    # Display name on newsletter emails (confirmation, welcome, campaigns).
    NEWSLETTER_FROM_NAME: str = "Meet Chetanpura"
    # Resend Segment that receives campaigns (Resend dashboard -> Audience -> Segments).
    RESEND_NEWSLETTER_SEGMENT_ID: str = ""
    # Signing secret of the Resend webhook (starts with "whsec_").
    RESEND_WEBHOOK_SECRET: str = ""
    # Signs unsubscribe links. Falls back to the JWT secret when empty.
    NEWSLETTER_CONFIRMATION_SECRET: str = ""
    NEWSLETTER_CONFIRMATION_HOURS: int = 48
    # true = confirmation email before a subscriber becomes active (recommended).
    NEWSLETTER_DOUBLE_OPT_IN: bool = True
    # Optional postal address shown in the footer of newsletter emails
    # (required by some anti-spam laws, e.g. CAN-SPAM for US recipients).
    NEWSLETTER_POSTAL_ADDRESS: str = ""

    @property
    def app_base_url(self) -> str:
        return self.APP_BASE_URL.strip().rstrip("/") or "https://www.meetchetanpura.in"

    @property
    def newsletter_segment_id(self) -> str:
        return self.RESEND_NEWSLETTER_SEGMENT_ID.strip()

    @property
    def resend_enabled(self) -> bool:
        return self.RESEND_API_KEY.strip().startswith("re_")

    @property
    def cors_origins(self) -> List[str]:
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        
        # Hardcode fallback allowed origins for seamless production/development integration
        fallbacks = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "https://ai-portfolio-dusky-zeta.vercel.app",
            "https://meetchetanpura.in",
            "https://www.meetchetanpura.in"
        ]
        for f in fallbacks:
            if f not in origins:
                origins.append(f)

        if not origins or "*" in origins:
            return ["*"]
        return origins

    @property
    def mail_enabled(self) -> bool:
        return bool(self.MAIL_SERVER and self.MAIL_USERNAME and self.MAIL_PASSWORD)

    @property
    def callmebot_enabled(self) -> bool:
        return bool(self.CALLMEBOT_PHONE and self.CALLMEBOT_APIKEY)

    @property
    def twilio_whatsapp_enabled(self) -> bool:
        return bool(
            self.TWILIO_ACCOUNT_SID
            and self.TWILIO_AUTH_TOKEN
            and self.TWILIO_WHATSAPP_FROM
            and self.ADMIN_PHONE_WHATSAPP
        )

    @property
    def twilio_enabled(self) -> bool:
        return bool(
            self.TWILIO_ACCOUNT_SID
            and self.TWILIO_AUTH_TOKEN
            and self.ADMIN_PHONE_SMS
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
