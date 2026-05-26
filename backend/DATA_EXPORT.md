# Contact data → Excel (CSV) — no Twilio needed

Every form submission is saved to:

```
backend/data/contact_submissions.csv
```

Open this file in **Microsoft Excel** or **Google Sheets**. Each new client adds one row.

## Columns

| Column | Description |
|--------|-------------|
| id | Database ID |
| created_at | Date & time (ISO) |
| full_name | Client name |
| email | Client email |
| phone | Mobile number |
| company | Company (optional) |
| service | Service selected |
| message | Full message |

## How to view

1. Submit a test form on your portfolio Contact page.
2. Open `C:\Users\meetc\ai_portfolio\backend\data\contact_submissions.csv` in Excel.
3. Refresh / reopen the file to see new rows (Excel may cache — close and reopen, or use Data → Refresh).

## Also stored in PostgreSQL

Table: `contacts` in database `ai_portfolio` (pgAdmin).

## Download copy via API

```http
GET http://127.0.0.1:8000/contact/export
Header: X-Admin-Key: (your ADMIN_API_KEY from .env)
```

## Optional email

Set Gmail App Password in `.env` → `MAIL_PASSWORD` to also receive email at `meetchetanpura9@gmail.com`.

Twilio is **not required**.
