"""
Create PostgreSQL database if it does not exist, then create all tables.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

from app.core.config import get_settings


def ensure_database_exists() -> str:
    """
    Connect to the default 'postgres' database and create the target DB if missing.
    Returns the full DATABASE_URL for the application database.
    """
    settings = get_settings()
    url = make_url(settings.DATABASE_URL)
    db_name = url.database

    if not db_name:
        raise ValueError("DATABASE_URL must include a database name")

    # Connect to maintenance DB (postgres)
    admin_url = url.set(database="postgres")
    engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")

    with engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": db_name},
        ).fetchone()

        if not exists:
            # Safe: db_name comes from our own config URL parsing
            conn.execute(text(f'CREATE DATABASE "{db_name}"'))
            print(f'Created database "{db_name}".')
        else:
            print(f'Database "{db_name}" already exists.')

    return settings.DATABASE_URL
