# Deployment Guide

## Frontend: Vercel

1. Create a Vercel account and connect your GitHub repository.
2. Import the project and set the root directory to `frontend/`.
3. Set the following settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework preset: `Vite`
4. Add production environment variables in Vercel:
   - `VITE_API_URL` = `https://<your-render-backend>.onrender.com`
5. Deploy and verify the site loads.

> The frontend uses `frontend/vercel.json` so Vercel knows how to build and route the app.

## Backend: Render

1. Create a Render account and connect the same GitHub repository.
2. Create a new Web Service.
3. Configure the service:
   - Environment: `Python`
   - Root directory: `backend/`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Branch: `main`
4. Add environment variables in Render:
   - `DATABASE_URL` = your Supabase/Postgres connection string
   - `ALLOWED_ORIGINS` = `https://<your-vercel-frontend>.vercel.app`
   - `ADMIN_EMAIL`, `ADMIN_NAME`, etc. as needed
5. Deploy the service and confirm the backend is reachable.

> The backend can also use `backend/render.yaml` as a Render service manifest.

## Database: Supabase

1. Create a Supabase project at https://app.supabase.com.
2. Create a new database and copy the connection URL.
3. Use the Supabase/Postgres connection string as the backend `DATABASE_URL`.
   - Example: `postgresql://postgres:<password>@<host>:5432/postgres`
4. Ensure the database is reachable from Render.

## Connecting the two services

1. Set `VITE_API_URL` in Vercel to the Render backend URL.
2. Ensure `ALLOWED_ORIGINS` in the backend includes your Vercel app URL.
3. Deploy backend first, then frontend.
4. Visit the Vercel frontend and test the contact form and API-driven pages.

## Notes

- Local dev already works using the existing Vite proxy in `frontend/vite.config.js`.
- Production uses `frontend/src/lib/api.js` to read `VITE_API_URL`.
- Do not commit real secrets; use Vercel and Render secret env vars instead.
