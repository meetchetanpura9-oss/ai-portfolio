import logging
import re

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def normalize_database_url(url: str) -> str:
    """
    Make hosted Postgres URLs work with SQLAlchemy + Psycopg 3:
    - Render / Heroku / Neon often hand out "postgres://", which SQLAlchemy 2 rejects.
    - SQLAlchemy 2.0 maps a bare "postgresql://" to psycopg2, so pin the driver
      explicitly to Psycopg 3 ("postgresql+psycopg://").
    Query parameters such as Neon's "?sslmode=require&channel_binding=require"
    are left untouched and passed straight through to libpq.
    """
    url = (url or "").strip().strip('"').strip("'")
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    elif url.startswith("postgresql+psycopg2://"):
        url = "postgresql+psycopg://" + url[len("postgresql+psycopg2://"):]
    return url


def redact_url(url: str) -> str:
    """Hide the password so the URL is safe to log or show on /health/db."""
    return re.sub(r"(://[^:/@]+:)[^@]+@", r"\1****@", url)


DATABASE_URL = normalize_database_url(settings.DATABASE_URL)
_is_sqlite = DATABASE_URL.startswith("sqlite")

_engine_kwargs = {"pool_pre_ping": True}
if _is_sqlite:
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    _engine_kwargs.update(
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        pool_recycle=280,  # hosted Postgres closes idle connections
        # Fail fast instead of hanging the request when the database is unreachable.
        connect_args={"connect_timeout": 10},
    )

engine = create_engine(DATABASE_URL, **_engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def check_database() -> dict:
    """
    Run SELECT 1 on the shared engine. The connection is returned to the pool
    by the context manager even if the query fails.

    Returns {"ok": bool, "error": str | None}. "error" is only the exception
    class name — the full message (which can contain host names, user names or
    DSN fragments) goes to the server log, never to API responses.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True, "error": None}
    except Exception as exc:  # noqa: BLE001 — we want every failure reason here
        logger.error("Database health check failed: %s: %s", type(exc).__name__, str(exc).split("\n")[0][:300])
        return {"ok": False, "error": type(exc).__name__}
