from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class NewsletterSubscribe(BaseModel):
    email: EmailStr
    # Explicit marketing consent — the request is rejected without it.
    consent: bool = False
    first_name: str | None = Field(default=None, max_length=120)
    source: str | None = Field(default=None, max_length=80)
    # Honeypot: real visitors never fill this hidden field.
    website: str | None = Field(default=None, max_length=200)

    @field_validator("first_name", "source")
    @classmethod
    def _clean(cls, value: str | None) -> str | None:
        value = (value or "").strip()
        return value or None


class TokenPayload(BaseModel):
    token: str = Field(min_length=10, max_length=200)


class SubscriberUpdate(BaseModel):
    # unsubscribe = opted out; suppress = blocked permanently (e.g. on request)
    action: Literal["unsubscribe", "suppress", "resend_confirmation"]


class CampaignWrite(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    subject: str = Field(default="", max_length=200)
    preview_text: str | None = Field(default=None, max_length=200)
    content: str = Field(default="", max_length=100_000)

    @field_validator("title", "subject")
    @classmethod
    def _strip(cls, value: str) -> str:
        # Header-injection guard: a subject must be a single line.
        return " ".join((value or "").split())


class CampaignPreview(BaseModel):
    content: str = Field(default="", max_length=100_000)
    preview_text: str | None = Field(default=None, max_length=200)


class CampaignSend(BaseModel):
    # Must be true: the admin has reviewed the preview and recipient count.
    confirm: bool = False
    # Recipient count the admin saw; the send is refused if it changed meanwhile.
    expected_recipients: int | None = None


class CampaignSchedule(CampaignSend):
    scheduled_at: datetime


class ImageRef(BaseModel):
    src: str = Field(max_length=500)
    alt: str = Field(default="", max_length=200)


class CaseStudyWrite(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    summary: str = Field(default="", max_length=2000)
    category: str | None = Field(default=None, max_length=60)
    cover_image_url: str | None = Field(default=None, max_length=500)
    problem_statement: str = Field(default="", max_length=50_000)
    project_overview: str = Field(default="", max_length=50_000)
    solution: str = Field(default="", max_length=50_000)
    technical_architecture: str = Field(default="", max_length=50_000)
    implementation: str = Field(default="", max_length=50_000)
    results: str = Field(default="", max_length=50_000)
    challenges: str = Field(default="", max_length=50_000)
    lessons_learned: str = Field(default="", max_length=50_000)
    architecture_steps: list[str] = Field(default_factory=list, max_length=20)
    technologies: list[str] = Field(default_factory=list, max_length=40)
    key_features: list[str] = Field(default_factory=list, max_length=40)
    screenshots: list[ImageRef] = Field(default_factory=list, max_length=20)
    github_url: str | None = Field(default=None, max_length=500)
    live_demo_url: str | None = Field(default=None, max_length=500)
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(default=None, max_length=320)
    featured: bool = False

    @field_validator("architecture_steps", "technologies", "key_features")
    @classmethod
    def _clean_list(cls, values: list[str]) -> list[str]:
        return [v.strip()[:300] for v in values if v and v.strip()]
