# AI Portfolio Website

A full-stack AI & data science portfolio website with a React + Vite frontend and a FastAPI backend.

## Repository structure

- `frontend/` — Vite React portfolio site
- `backend/` — FastAPI API for contact form and backend services
- `DEPLOYMENT.md` — deployment guide for Vercel and Render
- `.env.example` — example environment variables for backend configuration

## Local setup

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and update values for:
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- email/Twilio/admin settings if used

Start the backend:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deployment

This repository is configured to deploy as two separate services:

- Frontend: Vercel
- Backend: Render

See `DEPLOYMENT.md` for full deployment steps and environment variables.

## Notes

- The backend uses `VITE_API_URL` to connect the frontend to the deployed API.
- `venv/` is ignored by Git and should not be committed.
- Use environment variables instead of committing secrets.

## GitHub repository cleanup

- Add a root `README.md` (this file)
- Add a root `.gitignore` to exclude generated files
- Do not commit `venv/`, `node_modules/`, `dist/`, or private environment files

## License

This project is licensed under the MIT License. See `LICENSE` for details.
