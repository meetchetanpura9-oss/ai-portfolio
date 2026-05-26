"""
System metrics API — active database statistics, server uptime, and live status signals.
"""

from datetime import datetime, timezone
import time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.contact_model import Contact

router = APIRouter(prefix="/metrics", tags=["Metrics"])

# Record the timestamp when this module is first imported (approximate server start time)
SERVER_START_TIME = time.time()


@router.get("/stats", summary="Get live API & database stats")
def get_system_stats(db: Session = Depends(get_db)):
    """
    Returns live operational statistics for the portfolio:
    - Count of total contact form submissions in SQLite.
    - Calculated uptime since the server process started.
    - ISO timestamps.
    """
    # Count database contact records
    db_count = 0
    try:
        db_count = db.query(Contact).count()
    except Exception:
        # Fallback in case of database table not initialized yet
        db_count = 0

    # Calculate uptime
    current_time = time.time()
    uptime_seconds = int(current_time - SERVER_START_TIME)

    return {
        "api_status": "online",
        "db_submissions": db_count,
        "uptime_seconds": uptime_seconds,
        "server_time": datetime.now(timezone.utc).isoformat(),
    }
