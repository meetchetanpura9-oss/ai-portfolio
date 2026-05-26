"""
One-command database setup: create DB (if needed) + create tables.
Run from backend folder: python -m app.setup_db
"""

import sys

from sqlalchemy import text

from app.core.config import get_settings
from app.database.connection import Base, engine
from app.database.setup import ensure_database_exists
from app.models.contact_model import Contact  # noqa: F401
from app.models.project_model import Project  # noqa: F401


def main() -> int:
    settings = get_settings()
    parsed = settings.DATABASE_URL
    if "@" in parsed:
        safe = parsed.split("@")[-1]
        print(f"Target: postgresql://***@{safe}")
    else:
        print(f"Target: {parsed}")

    try:
        ensure_database_exists()
    except Exception as exc:
        print("\nFailed to create database:", exc)
        print(
            "\nCheck:\n"
            "  1. PostgreSQL service is running\n"
            "  2. backend/.env has correct password in DATABASE_URL\n"
            "     Example: postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_portfolio\n"
        )
        return 1

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        Base.metadata.create_all(bind=engine)
        print("Tables created/verified successfully.")
        print("\nStart API: uvicorn app.main:app --reload")
        return 0
    except Exception as exc:
        print("\nFailed after database creation:", exc)
        return 1


if __name__ == "__main__":
    sys.exit(main())
