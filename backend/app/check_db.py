"""
Verify PostgreSQL connection and create tables.
Run from backend folder: python -m app.check_db
"""

import sys

from sqlalchemy import text

from app.core.config import get_settings
from app.database.connection import Base, engine
from app.models.contact_model import Contact  # noqa: F401
from app.models.project_model import Project  # noqa: F401


def main() -> int:
    settings = get_settings()
    # Mask password in output
    safe_url = settings.DATABASE_URL
    if "@" in safe_url:
        prefix, rest = safe_url.split("@", 1)
        if ":" in prefix:
            user_part = prefix.rsplit(":", 1)[0]
            safe_url = f"{user_part}:****@{rest}"

    print(f"Connecting to: {safe_url}")

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database connection OK.")
    except Exception as exc:
        print("\nConnection failed:", exc)
        print(
            "\nFix steps:\n"
            "  1. Ensure PostgreSQL is running (Services or pgAdmin).\n"
            "  2. Edit backend/.env — set DATABASE_URL with your real postgres password:\n"
            "     DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/portfolio_db\n"
            "  3. Create the database if missing (psql or pgAdmin):\n"
            "     CREATE DATABASE portfolio_db;\n"
        )
        return 1

    Base.metadata.create_all(bind=engine)
    print("Tables created/verified successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
