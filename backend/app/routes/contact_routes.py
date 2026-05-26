"""
Contact form API — validate, persist, notify.
"""

import csv
import html
import io
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import HTMLResponse, StreamingResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.admin_auth import verify_admin_key
from app.core.config import get_settings
from app.database.db import get_db
from app.models.contact_model import Contact
from app.schemas.contact_schema import (
    ContactCreate,
    ContactListItem,
    ContactResponse,
)
from app.services.csv_storage import append_contact_to_csv, get_csv_path
from app.services.email_service import send_contact_emails
from app.services.rate_limiter import enforce_rate_limit

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Contact"])


@router.post(
    "/contact",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact form",
)
async def submit_contact(
    payload: ContactCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    enforce_rate_limit(request)
    settings = get_settings()

    contact = Contact(
        full_name=payload.full_name,
        email=payload.email.lower(),
        phone=payload.phone,
        company=payload.company,
        service=payload.service,
        message=payload.message,
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

    # Always append to CSV (Excel) — primary export for admin
    try:
        append_contact_to_csv(contact)
    except Exception as exc:
        logger.exception("CSV save failed: %s", exc)

    # Optional Gmail notification (only if MAIL_PASSWORD is set)
    try:
        await send_contact_emails(contact, settings)
    except Exception as exc:
        logger.exception("Email notification failed: %s", exc)

    return ContactResponse(
        id=contact.id,
        message="Thank you! Your message has been received successfully.",
        created_at=contact.created_at,
    )


@router.get(
    "/contact",
    response_model=list[ContactListItem],
    summary="List all contact submissions (JSON)",
    dependencies=[Depends(verify_admin_key)],
)
def list_contacts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    contacts = (
        db.query(Contact)
        .order_by(Contact.created_at.desc())
        .offset(skip)
        .limit(min(limit, 500))
        .all()
    )
    return contacts


@router.get(
    "/admin/contacts",
    response_class=HTMLResponse,
    summary="Admin page for contact submissions",
    dependencies=[Depends(verify_admin_key)],
)
def admin_contacts_page(
    admin_key: str | None = Query(default=None),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    contacts = (
        db.query(Contact)
        .order_by(Contact.created_at.desc())
        .offset(skip)
        .limit(min(limit, 500))
        .all()
    )
    total = db.query(Contact).count()
    key_query = f"?admin_key={html.escape(admin_key)}" if admin_key else ""
    rows = []

    for contact in contacts:
        created_at = contact.created_at.strftime("%Y-%m-%d %H:%M") if contact.created_at else ""
        rows.append(
            f"""
            <tr>
              <td>{contact.id}</td>
              <td><strong>{html.escape(contact.full_name)}</strong></td>
              <td><a href="mailto:{html.escape(contact.email)}">{html.escape(contact.email)}</a></td>
              <td>{html.escape(contact.phone)}</td>
              <td>{html.escape(contact.company or "-")}</td>
              <td>{html.escape(contact.service)}</td>
              <td class="message">{html.escape(contact.message)}</td>
              <td>{created_at}</td>
            </tr>
            """
        )

    table_rows = "\n".join(rows) or """
      <tr>
        <td colspan="8" class="empty">No contact submissions yet.</td>
      </tr>
    """

    return f"""
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Contact Submissions</title>
        <style>
          :root {{ color-scheme: dark; }}
          body {{
            margin: 0;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #080812;
            color: #f5f5f7;
          }}
          main {{ max-width: 1280px; margin: 0 auto; padding: 32px 20px; }}
          header {{
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 24px;
          }}
          h1 {{ margin: 0; font-size: clamp(28px, 4vw, 44px); }}
          p {{ margin: 8px 0 0; color: #9ca3af; }}
          a.button {{
            border: 1px solid rgba(167, 139, 250, .35);
            border-radius: 10px;
            color: #ddd6fe;
            padding: 10px 14px;
            text-decoration: none;
            background: rgba(139, 92, 246, .12);
            white-space: nowrap;
          }}
          .table-wrap {{
            overflow-x: auto;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 14px;
            background: rgba(255,255,255,.04);
          }}
          table {{ width: 100%; border-collapse: collapse; min-width: 1100px; }}
          th, td {{
            border-bottom: 1px solid rgba(255,255,255,.08);
            padding: 12px 14px;
            text-align: left;
            vertical-align: top;
            font-size: 14px;
          }}
          th {{
            position: sticky;
            top: 0;
            background: #151526;
            color: #c4b5fd;
            font-size: 12px;
            letter-spacing: .08em;
            text-transform: uppercase;
          }}
          td {{ color: #e5e7eb; }}
          td a {{ color: #93c5fd; }}
          .message {{ max-width: 320px; white-space: pre-wrap; color: #cbd5e1; }}
          .empty {{ padding: 40px; text-align: center; color: #9ca3af; }}
          @media (max-width: 720px) {{
            header {{ align-items: start; flex-direction: column; }}
          }}
        </style>
      </head>
      <body>
        <main>
          <header>
            <div>
              <h1>Contact Submissions</h1>
              <p>{total} total clients/messages saved in PostgreSQL.</p>
            </div>
            <a class="button" href="/contact/export{key_query}">Download CSV</a>
          </header>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Service</th>
                  <th>Message</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>{table_rows}</tbody>
            </table>
          </div>
        </main>
      </body>
    </html>
    """


@router.get(
    "/contact/export",
    summary="Download all submissions as CSV (opens in Excel)",
    dependencies=[Depends(verify_admin_key)],
)
def export_contacts_csv(db: Session = Depends(get_db)):
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "id",
            "full_name",
            "email",
            "phone",
            "company",
            "service",
            "message",
            "created_at",
        ]
    )
    for c in contacts:
        writer.writerow(
            [
                c.id,
                c.full_name,
                c.email,
                c.phone,
                c.company or "",
                c.service,
                c.message,
                c.created_at.isoformat() if c.created_at else "",
            ]
        )

    buffer.seek(0)
    filename = f"contact_submissions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/contact/csv-info",
    summary="Path to the live CSV file (Excel)",
    dependencies=[Depends(verify_admin_key)],
)
def csv_file_info():
    path = get_csv_path()
    return {
        "csv_path": str(path.resolve()),
        "exists": path.exists(),
        "hint": "Open this file in Excel — new form rows append automatically.",
    }
