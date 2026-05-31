from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String
from app.database.connection import Base

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    visitor_ip = Column(String(45), nullable=True)
    country = Column(String(100), default="Unknown", nullable=True)
    device = Column(String(50), default="Unknown", nullable=True)
    browser = Column(String(50), default="Unknown", nullable=True)
    visited_page = Column(String(255), default="/", nullable=True)
    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
