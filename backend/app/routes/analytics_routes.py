import json
import logging
import urllib.request
from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.analytics_model import Analytics
from app.models.contact_model import Contact
from app.schemas.analytics_schema import AnalyticsTrack, AnalyticsDashboard, AnalyticsSummaryItem
from app.services.auth_service import get_current_user
from app.models.user_model import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_client_ip(request: Request) -> str:
    """Extract real client IP from request headers (handles Vercel/Cloudflare proxies)."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # X-Forwarded-For can contain multiple IPs. The first one is the client.
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    return request.client.host if request.client else "127.0.0.1"

def resolve_ip_country(ip: str, analytics_id: int, db_session_maker) -> None:
    """Resolve IP country geolocation in background thread to avoid request blocking."""
    if not ip or ip in ["127.0.0.1", "localhost", "::1"]:
        return
        
    try:
        url = f"http://ip-api.com/json/{ip}?fields=status,country,message"
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data.get("status") == "success" and data.get("country"):
                country_name = data.get("country")
                
                # Update DB record with resolved country
                db = db_session_maker()
                try:
                    record = db.query(Analytics).filter(Analytics.id == analytics_id).first()
                    if record:
                        record.country = country_name
                        db.commit()
                        logger.info(f"Resolved IP {ip} to country: {country_name}")
                except Exception as db_err:
                    db.rollback()
                    logger.error(f"Failed to update country in db: {db_err}")
                finally:
                    db.close()
    except Exception as e:
        logger.error(f"IP Geolocation error: {e}")

@router.post("/track", summary="Log page view analytics")
def track_visitor(
    payload: AnalyticsTrack,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Log visitor telemetry parameters (page, device, browser) and queue background geolocation.
    """
    ip = get_client_ip(request)
    
    analytics = Analytics(
        visitor_ip=ip,
        device=payload.device,
        browser=payload.browser,
        visited_page=payload.visited_page,
        country="Unknown" # Populated asynchronously
    )
    db.add(analytics)
    db.commit()
    db.refresh(analytics)
    
    # Queue geo-lookup in a background task
    # We pass database session generator so background task can establish a separate session cleanly
    background_tasks.add_task(resolve_ip_country, ip, analytics.id, get_db.__wrapped__)
    
    return {"status": "logged"}

@router.get("/summary", response_model=AnalyticsDashboard, summary="Retrieve analytics dashboard summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aggregate visitor traffic statistics and convertion rates for the Admin dashboard.
    """
    # 1. Base counts
    total_views = db.query(Analytics).count()
    unique_visitors = db.query(func.count(func.distinct(Analytics.visitor_ip))).scalar() or 0
    total_contacts = db.query(Contact).count()
    
    # 2. Conversion rate
    conversion_rate = 0.0
    if unique_visitors > 0:
        conversion_rate = round((total_contacts / unique_visitors) * 100, 2)
        
    # Helper to format group results
    def get_breakdown(model_field, limit=10):
        rows = (
            db.query(model_field, func.count(Analytics.id).label("count"))
            .group_by(model_field)
            .order_by(func.count(Analytics.id).desc())
            .limit(limit)
            .all()
        )
        return [AnalyticsSummaryItem(label=str(r[0] or "Unknown"), count=r[1]) for r in rows]

    return AnalyticsDashboard(
        total_views=total_views,
        unique_visitors=unique_visitors,
        conversion_rate=conversion_rate,
        browsers=get_breakdown(Analytics.browser),
        devices=get_breakdown(Analytics.device),
        countries=get_breakdown(Analytics.country)
    )
