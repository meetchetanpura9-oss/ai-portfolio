"""
Pydantic schemas for contact API validation and responses.
"""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

PHONE_PATTERN = re.compile(r"^\+?[\d\s\-().]{7,20}$")

# Suggested services shown in the form. Visitors can also type their own service,
# so any non-empty text up to 120 characters is accepted.
SERVICE_OPTIONS = [
    "AI Agent / Workflow Automation",
    "AI / LLM Application",
    "Machine Learning Model",
    "Data Analytics & BI",
    "Web / Business Software",
    "Mentorship / Collaboration",
]


class ContactCreate(BaseModel):
    """Incoming contact form payload."""

    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=32)
    company: Optional[str] = Field(default=None, max_length=120)
    service: str = Field(..., min_length=2, max_length=120)
    message: str = Field(..., min_length=10, max_length=5000)
    # Honeypot — must remain empty (bots often fill hidden fields)
    website: Optional[str] = Field(default=None, max_length=200)

    @field_validator("full_name", "company", "message", mode="before")
    @classmethod
    def strip_strings(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip()
        if not PHONE_PATTERN.match(cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned

    @field_validator("service")
    @classmethod
    def validate_service(cls, v: str) -> str:
        # Collapse whitespace/newlines so custom services stay on one line in notifications.
        cleaned = " ".join(v.split())
        if len(cleaned) < 2:
            raise ValueError("Please describe the service you need")
        return cleaned

    @field_validator("website")
    @classmethod
    def honeypot_empty(cls, v: Optional[str]) -> Optional[str]:
        if v and str(v).strip():
            raise ValueError("Spam detected")
        return None


class ContactResponse(BaseModel):
    """Successful submission response."""

    id: int
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactListItem(BaseModel):
    """Admin dashboard-ready list item."""

    id: int
    full_name: str
    email: str
    phone: str
    company: Optional[str]
    service: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}
