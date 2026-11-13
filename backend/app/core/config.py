"""
Application settings loaded from environment variables.
Never commit real secrets — use .env locally and platform secrets in production.
"""

import logging
import os
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

    # --- Environment & signing secrets -----------------------------------------------
    # "production" | "development" | "test". Only used when NOT on Render: Render sets
    # RENDER=true on every service, and that always means production (APP_ENV cannot
    # downgrade it). Empty = development.
    APP_ENV: str = ""
    # Signs admin login tokens (JWT). Required in production; must be independent of
    # every other credential. Never derived from DATABASE_URL.
    JWT_SECRET: str = ""

    @property
    def environment(self) -> str:
        # Checked first: on Render this is always production, even if APP_ENV was
        # accidentally set to development/test (which would otherwise disable the
        # production secret checks).
        if os.getenv("RENDER", "").strip().lower() == "true":
            return "production"
        return self.APP_ENV.strip().lower() or "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def jwt_secret(self) -> str:
        return resolve_secrets(self)[0]

    @property
    def newsletter_secret(self) -> str:
        return resolve_secrets(self)[1]

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


# --- Signing secrets ---------------------------------------------------------------
class SecretConfigError(RuntimeError):
    """Raised at startup when production signing secrets are missing or unsafe."""


# Used ONLY outside production (local development / tests), and labelled as such so they
# are never mistaken for real secrets. Production refuses to start without real ones.
DEV_JWT_SECRET = "dev-only-insecure-jwt-secret--never-use-in-production"
DEV_NEWSLETTER_SECRET = "dev-only-insecure-newsletter-secret--never-use-in-production"
MIN_SECRET_LENGTH = 32

_logger = logging.getLogger(__name__)
_warned_dev_secrets = False


def production_secret_problems(settings: "Settings") -> list[str]:
    """Every reason the configured secrets are not acceptable for production (no values echoed)."""
    jwt_secret = settings.JWT_SECRET.strip()
    newsletter_secret = settings.NEWSLETTER_CONFIRMATION_SECRET.strip()
    database_url = settings.DATABASE_URL or ""
    problems: list[str] = []
    for name, value in (("JWT_SECRET", jwt_secret), ("NEWSLETTER_CONFIRMATION_SECRET", newsletter_secret)):
        if not value:
            problems.append(f"{name} is not set.")
        elif value in (DEV_JWT_SECRET, DEV_NEWSLETTER_SECRET):
            problems.append(f"{name} is a development placeholder.")
        elif value in database_url:
            problems.append(f"{name} must not be part of DATABASE_URL (use an independent random value).")
        elif len(value) < MIN_SECRET_LENGTH:
            # Only the length requirement is reported — never the value or its length.
            problems.append(f"{name} must be at least {MIN_SECRET_LENGTH} characters long.")
    if jwt_secret and jwt_secret == newsletter_secret:
        problems.append("JWT_SECRET and NEWSLETTER_CONFIRMATION_SECRET must be different values.")
    return problems


def resolve_secrets(settings: "Settings") -> tuple[str, str]:
    """
    (jwt_secret, newsletter_secret).

    Production: both must be explicitly configured, independent of each other and of the
    database credentials — otherwise SecretConfigError stops the app from starting.
    Development / test: missing values fall back to the labelled DEV_* placeholders.
    Nothing is ever derived from DATABASE_URL.
    """
    global _warned_dev_secrets
    jwt_secret = settings.JWT_SECRET.strip()
    newsletter_secret = settings.NEWSLETTER_CONFIRMATION_SECRET.strip()

    if settings.is_production:
        problems = production_secret_problems(settings)
        if problems:
            raise SecretConfigError(
                "Refusing to start in production: " + " ".join(problems)
                + " Set them in the Render dashboard (Environment). Generate each with: "
                "python -c \"import secrets; print(secrets.token_urlsafe(48))\""
            )
        return jwt_secret, newsletter_secret

    if (not jwt_secret or not newsletter_secret) and not _warned_dev_secrets:
        _warned_dev_secrets = True
        _logger.warning("Using development-only signing secrets (APP_ENV=%s). Never deploy like this.",
                        settings.environment)
    return jwt_secret or DEV_JWT_SECRET, newsletter_secret or DEV_NEWSLETTER_SECRET
