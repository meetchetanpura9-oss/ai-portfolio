"""
SQLAlchemy model for contact form submissions.
Structured for future admin dashboard listing / filtering.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database.connection import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(32), nullable=False)
    company = Column(String(120), nullable=True)
    service = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True)
    country = Column(String(100), default="Unknown", nullable=True)
    status = Column(String(50), default="new", nullable=False) # e.g. new, read, replied
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
