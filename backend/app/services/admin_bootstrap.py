"""Create the initial admin only when credentials are explicitly configured."""

import logging
from collections.abc import Callable

from sqlalchemy.orm import Session

from app.models.user_model import User
from app.services.auth_service import hash_password


def create_admin_if_configured(
    session_factory: Callable[[], Session],
    *,
    email: str,
    name: str,
    password: str | None,
) -> bool:
    if not password or not password.strip() or not email.strip() or email.strip().lower() == "admin@example.com":
        logging.info("Admin setup skipped: configure ADMIN_EMAIL and ADMIN_PASSWORD.")
        return False

    db: Session | None = None
    try:
        db = session_factory()
        if db.query(User).count() != 0:
            logging.info("Admin user check completed. User already exists.")
            return False

        db.add(
            User(
                name=name.strip() or "Administrator",
                email=email.strip().lower(),
                hashed_password=hash_password(password),
                role="admin",
            )
        )
        db.commit()
        logging.info("Admin user created.")
        return True
    except Exception:
        if db is not None:
            db.rollback()
        logging.error("Admin setup failed.")
        return False
    finally:
        if db is not None:
            db.close()
