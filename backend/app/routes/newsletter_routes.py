from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database.db import get_db
from app.models.newsletter_model import NewsletterSubscriber
from app.schemas.newsletter_schema import NewsletterSubscribe

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

@router.post("/subscribe", status_code=status.HTTP_201_CREATED, summary="Subscribe to newsletter")
def subscribe(
    payload: NewsletterSubscribe,
    db: Session = Depends(get_db)
):
    """
    Register a visitor email address to the newsletter subscription list.
    """
    email_clean = payload.email.lower().strip()
    
    # Check if already exists to return friendly response
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email_clean).first()
    if existing:
        return {"message": "You are already subscribed to the newsletter!"}
        
    subscriber = NewsletterSubscriber(email=email_clean)
    db.add(subscriber)
    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"message": "You are already subscribed to the newsletter!"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Mailing service error. Please try again later."
        ) from exc
        
    return {"message": "Thank you! You have successfully subscribed to the newsletter."}
