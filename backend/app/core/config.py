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
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_NAME: str = "Portfolio Admin"
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
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"
    ADMIN_PHONE_SMS: str = ""
    ADMIN_PHONE_WHATSAPP: str = ""

    # Optional: protect GET /contact and /contact/export (set a long random string)
    ADMIN_API_KEY: str = ""

    @property
    def cors_origins(self) -> List[str]:
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        
        # Hardcode fallback allowed origins for seamless production/development integration
        fallbacks = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "https://ai-portfolio-dusky-zeta.vercel.app"
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
    def twilio_enabled(self) -> bool:
        return bool(
            self.TWILIO_ACCOUNT_SID
            and self.TWILIO_AUTH_TOKEN
            and self.ADMIN_PHONE_SMS
        )

    @property
    def twilio_whatsapp_enabled(self) -> bool:
        return self.twilio_enabled and bool(self.ADMIN_PHONE_WHATSAPP)


@lru_cache
def get_settings() -> Settings:
    return Settings()
