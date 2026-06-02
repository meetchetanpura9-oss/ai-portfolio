"""
Contact form API — validate, persist, notify, status updates, and reports generation.
"""

import io
import logging
import urllib.request
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.contact_model import Contact
from app.models.user_model import User
from app.schemas.contact_schema import (
    ContactCreate,
    ContactResponse,
)
from app.services.email_delivery import deliver_contact_emails
from app.services.auth_service import get_current_user
from app.services.rate_limiter import enforce_rate_limit

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Contact"])

def get_client_ip(request: Request) -> str:
    """Extract real client IP (supports proxy headers)."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    return request.client.host if request.client else "127.0.0.1"

def resolve_contact_country(contact_id: int, ip: str) -> None:
    """Resolve geolocation for contact submission in the background."""
    if not ip or ip in ["127.0.0.1", "localhost", "::1"]:
        return
        
    try:
        url = f"http://ip-api.com/json/{ip}?fields=status,country"
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data.get("status") == "success" and data.get("country"):
                country = data.get("country")
                from app.database.connection import SessionLocal
                db = SessionLocal()
                try:
                    c = db.query(Contact).filter(Contact.id == contact_id).first()
                    if c:
                        c.country = country
                        db.commit()
                        logger.info(f"Resolved contact ip {ip} to {country}")
                except Exception as db_err:
                    db.rollback()
                    logger.error(f"Failed to update contact country: {db_err}")
                finally:
                    db.close()
    except Exception as e:
        logger.error(f"Contact country resolution error: {e}")

@router.post(
    "/contact",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact form",
)
async def submit_contact(
    payload: ContactCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Handle contact submissions. Saves details in Postgres, resolves IP, and triggers notification emails.
    """
    enforce_rate_limit(request)
    
    ip = get_client_ip(request)

    from app.utils.classifier import classify_inquiry
    inquiry_tag = classify_inquiry(payload.message, payload.service)

    contact = Contact(
        full_name=payload.full_name,
        email=payload.email.lower().strip(),
        phone=payload.phone,
        company=payload.company,
        service=payload.service,
        message=payload.message,
        ip_address=ip,
        country="Unknown",
        status="new",
        inquiry_type=inquiry_tag,
        notification_status="pending"
    )

    try:
        db.add(contact)
        db.commit()
        db.refresh(contact)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Database error saving contact")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save your message. Please try again later.",
        ) from exc

    # Geolocation lookup background task
    background_tasks.add_task(resolve_contact_country, contact.id, ip)

    # Async email notification task (dynamic Resend API with SMTP fallback)
    background_tasks.add_task(deliver_contact_emails, contact.id)

    return ContactResponse(
        id=contact.id,
        message="Thank you! Your message has been received successfully.",
        created_at=contact.created_at,
    )

# --- Admin Dashboards Routing ---

@router.get(
    "/admin/contacts",
    summary="List all contact submissions",
)
def list_contacts(
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve contact submissions. Supports message/name search filters, pagination, and status filters.
    """
    query = db.query(Contact)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Contact.full_name.ilike(search_term)) |
            (Contact.email.ilike(search_term)) |
            (Contact.message.ilike(search_term)) |
            (Contact.company.ilike(search_term))
        )
        
    if status_filter:
        query = query.filter(Contact.status == status_filter.lower())
        
    contacts = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "contacts": [
            {
                "id": c.id,
                "full_name": c.full_name,
                "email": c.email,
                "phone": c.phone,
                "company": c.company,
                "service": c.service,
                "message": c.message,
                "ip_address": c.ip_address,
                "country": c.country,
                "status": c.status,
                "notification_status": c.notification_status,
                "notification_error": c.notification_error,
                "inquiry_type": c.inquiry_type,
                "created_at": c.created_at,
            }
            for c in contacts
        ],
        "total": total
    }

@router.patch(
    "/admin/contacts/{contact_id}",
    summary="Update submission status",
)
def update_contact_status(
    contact_id: int,
    status_payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the processing status (new, read, replied) of a submission.
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
        
    new_status = status_payload.get("status", "").lower()
    if new_status not in ["new", "read", "replied"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Choose from: new, read, replied"
        )
        
    contact.status = new_status
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update error: {e}"
        )
        
    return {"status": "updated", "contact_id": contact.id, "new_status": new_status}

@router.delete(
    "/admin/contacts/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a submission",
)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a contact submission permanently from PostgreSQL database.
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
        
    try:
        db.delete(contact)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database deletion error: {e}"
        )
    return None

# --- Report Downloads endpoints ---

@router.get(
    "/admin/export/csv",
    summary="Download submissions as CSV",
)
def export_contacts_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate and stream all contact form submissions as an Excel-compatible CSV.
    """
    from app.services.export_service import generate_contacts_csv
    
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()
    csv_data = generate_contacts_csv(contacts)
    
    filename = f"contacts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        },
    )

@router.get(
    "/admin/export/excel",
    summary="Download submissions as Excel",
)
def export_contacts_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate and stream all contact form submissions as a fully styled Excel (.xlsx) sheet.
    """
    from app.services.export_service import generate_contacts_excel
    
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()
    excel_data = generate_contacts_excel(contacts)
    
    filename = f"contacts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        io.BytesIO(excel_data),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        },
    )
