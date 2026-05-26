"""
Append each contact submission to a CSV file (opens directly in Microsoft Excel).
No Twilio or third-party messaging required.
"""

import csv
import logging
from datetime import datetime, timezone
from pathlib import Path

from app.core.config import get_settings
from app.models.contact_model import Contact

logger = logging.getLogger(__name__)

CSV_HEADERS = [
    "id",
    "created_at",
    "full_name",
    "email",
    "phone",
    "company",
    "service",
    "message",
]


def get_csv_path() -> Path:
    settings = get_settings()
    path = Path(settings.CONTACT_CSV_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def append_contact_to_csv(contact: Contact) -> Path:
    """Append one row to the Excel-compatible CSV file."""
    path = get_csv_path()
    write_header = not path.exists() or path.stat().st_size == 0

    created = contact.created_at
    if created is None:
        created = datetime.now(timezone.utc)
    created_str = created.isoformat() if hasattr(created, "isoformat") else str(created)

    row = {
        "id": contact.id or "",
        "created_at": created_str,
        "full_name": contact.full_name,
        "email": contact.email,
        "phone": contact.phone,
        "company": contact.company or "",
        "service": contact.service,
        "message": contact.message,
    }

    with path.open("a", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        if write_header:
            writer.writeheader()
        writer.writerow(row)

    logger.info("Contact saved to CSV: %s (id=%s)", path, contact.id)
    return path
