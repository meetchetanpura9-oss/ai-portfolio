import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy import text

from app.core.config import get_settings
from app.routes.contact_routes import router as contact_router
from app.routes.project_routes import router as project_router
from app.routes.metrics_routes import router as metrics_router
from app.routes.playground_routes import router as playground_router
from app.routes.auth_routes import router as auth_router
from app.routes.newsletter_routes import router as newsletter_router
from app.routes.analytics_routes import router as analytics_router

from app.database.connection import Base, engine, SessionLocal
from app.models.contact_model import Contact  # noqa: F401
from app.models.project_model import Project  # noqa: F401
from app.models.user_model import User  # noqa: F401
from app.models.newsletter_model import NewsletterSubscriber  # noqa: F401
from app.models.admin_log_model import AdminLog  # noqa: F401
from app.models.analytics_model import Analytics  # noqa: F401
from app.services.auth_service import hash_password

logging.basicConfig(level=logging.INFO)

settings = get_settings()

# 1. Automatically create/verify database tables on application startup
try:
    Base.metadata.create_all(bind=engine)
    logging.info("Database tables verified/created successfully.")
except Exception as e:
    logging.error(f"Error during database table auto-creation: {e}")

# 2. Schema patches (ensure new columns exist in contacts table)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)"))
        conn.execute(text("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Unknown'"))
        conn.execute(text("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new'"))
        conn.commit()
        logging.info("Database migrations/patches applied successfully.")
except Exception as e:
    logging.error(f"Database schema patch warning: {e}")

# 3. Create default admin user on startup if missing
db = SessionLocal()
try:
    admin_count = db.query(User).count()
    if admin_count == 0:
        import os
        admin_email = settings.ADMIN_EMAIL if settings.ADMIN_EMAIL != "admin@example.com" else "meetchetanpura9@gmail.com"
        admin_password = os.getenv("ADMIN_PASSWORD", "MeetAdmin2026!")
        admin_user = User(
            name=settings.ADMIN_NAME if settings.ADMIN_NAME != "Portfolio Admin" else "Meet Chetanpura",
            email=admin_email.lower().strip(),
            hashed_password=hash_password(admin_password),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        logging.info(f"Auto-created default admin user: {admin_email} with password: {admin_password}")
    else:
        logging.info("Admin user check completed. User already exists.")
except Exception as e:
    db.rollback()
    logging.error(f"Failed to auto-create default admin: {e}")
finally:
    db.close()

# 4. Instantiate FastAPI
app = FastAPI(
    title="AI Portfolio API",
    description="Backend for Chetanpura Meet — AI & Data Science portfolio",
    version="1.0.0",
)

# Store settings in app state for access across routes
app.state.settings = settings

allow_origins = settings.cors_origins
allow_credentials = bool(allow_origins and allow_origins != ["*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(contact_router)
app.include_router(project_router)
app.include_router(metrics_router)
app.include_router(playground_router)
app.include_router(auth_router)
app.include_router(newsletter_router)
app.include_router(analytics_router)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
def home():
    """Browser-friendly landing page (API is JSON at /health, /docs)."""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>AI Portfolio API</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0A0A0F; color: #e5e5e5;
               display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                border-radius: 16px; padding: 2rem; max-width: 420px; backdrop-filter: blur(12px); }
        h1 { margin: 0 0 0.5rem; font-size: 1.5rem; color: #a78bfa; }
        p { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; }
        a { color: #c4b5fd; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ul { padding-left: 1.2rem; margin-top: 1rem; }
        li { margin: 0.5rem 0; }
        .ok { color: #34d399; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>AI Portfolio API</h1>
        <p class="ok">Server is running</p>
        <ul>
          <li><a href="/docs">Interactive API docs (/docs)</a></li>
          <li><a href="/health">Health check (/health)</a></li>
          <li><a href="/redoc">ReDoc (/redoc)</a></li>
        </ul>
        <p style="margin-top:1.5rem;font-size:0.85rem;">
          Your React app runs separately — usually
          <a href="http://localhost:5173">localhost:5173</a>
        </p>
      </div>
    </body>
    </html>
    """
