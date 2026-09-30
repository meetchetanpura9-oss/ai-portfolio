# Deployment Guide

## Frontend: Vercel

1. Create a Vercel account and connect your GitHub repository.
2. Import the project and set the root directory to `frontend/`.
3. Set the following settings:
   - Build command: `npm run build`
   - Framework preset: `Next.js`
   - Output directory: use the Next.js default
4. Add production environment variables in Vercel:
   - Required for the Next.js contact and newsletter routes: `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, and `ADMIN_EMAIL`.
   - Optional: `SITE_NAME` and the `NEXT_PUBLIC_CONTACT_*` values listed in `frontend/.env.example`.
   - Leave `NEXT_PUBLIC_API_URL` unset to use the same-origin Next.js `/api` routes.
5. Deploy and verify the site loads.

> `frontend/vercel.json` selects the Next.js framework. The App Router handles page and API routes.

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

1. Configure the frontend mail variables in Vercel for its same-origin contact and newsletter routes.
2. If another frontend feature calls the Render backend directly, configure that feature's API URL and include the Vercel app URL in backend `ALLOWED_ORIGINS`.
3. Deploy backend first if those features require it, then frontend.
4. Visit the Vercel frontend and test the contact form and API-driven pages.

## Notes

- Local Next.js development uses `npm run dev` from `frontend/`.
- `frontend/src/lib/api.ts` defaults to same-origin `/api` and can read `NEXT_PUBLIC_API_URL` when a separate API target is intentionally configured.
- Do not commit real secrets; use Vercel and Render secret env vars instead.
