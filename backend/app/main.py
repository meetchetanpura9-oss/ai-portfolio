import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.core.config import get_settings
from app.routes.contact_routes import router as contact_router
from app.routes.project_routes import router as project_router
from app.routes.metrics_routes import router as metrics_router
from app.routes.playground_routes import router as playground_router

logging.basicConfig(level=logging.INFO)

settings = get_settings()

app = FastAPI(
    title="AI Portfolio API",
    description="Backend for Chetanpura Meet — AI & Data Science portfolio",
    version="1.0.0",
)

allow_origins = settings.cors_origins
allow_credentials = bool(allow_origins and allow_origins != ["*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(contact_router)
app.include_router(project_router)
app.include_router(metrics_router)
app.include_router(playground_router)


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
