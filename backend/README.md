# Portfolio API (FastAPI)

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env    # edit with your values
```

## Database

```bash
# Creates database + tables (reads DATABASE_URL from .env)
python -m app.setup_db
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/contact` | Submit contact form |
| GET | `/contact` | List submissions (secure in production) |
| GET | `/health` | Health check |

## Environment

See `.env.example` for SMTP, Twilio, and database settings.  
Email and Twilio are optional — submissions always save to PostgreSQL.
