# Contact notifications setup

> **Recommended:** Use **Excel CSV** + PostgreSQL — see `DATA_EXPORT.md` (no Twilio required).

When a visitor submits the contact form:

| Channel | Destination |
|---------|-------------|
| **Excel CSV** | `backend/data/contact_submissions.csv` (automatic) |
| **PostgreSQL** | Table `contacts` in `ai_portfolio` |
| **Email** (optional) | meetchetanpura9@gmail.com — Gmail App Password in `.env` |
| **SMS / WhatsApp** (optional) | Twilio — skip if not needed |

---

## 1. Email (Gmail)

1. Open Google Account → **Security** → enable **2-Step Verification**.
2. Create an **App Password** for “Mail”.
3. In `backend/.env`:

```env
MAIL_USERNAME=meetchetanpura9@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=meetchetanpura9@gmail.com
ADMIN_EMAIL=meetchetanpura9@gmail.com
```

4. Restart API: `.\start_server.ps1`

You get:
- **Admin email** — full form details (HTML)
- **Auto-reply** — sent to the customer’s email

---

## 2. SMS & WhatsApp (Twilio)

SMS/WhatsApp do **not** work without a Twilio account (free trial available).

1. Sign up: https://www.twilio.com/
2. Copy **Account SID** and **Auth Token** from the console.
3. Buy or use a Twilio phone number for **SMS** (`TWILIO_SMS_FROM=+1...`).
4. For **WhatsApp** (sandbox for testing):
   - Console → Messaging → Try WhatsApp
   - Join sandbox from your phone (+919998471715)
   - Use sandbox `from` number in `TWILIO_WHATSAPP_FROM`

```env
TWILIO_ACCOUNT_SID=AC483ce6379deb55a06b023484825f5e51
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_SMS_FROM=+1xxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_PHONE_SMS=+919998471715
ADMIN_PHONE_WHATSAPP=whatsapp:+919998471715
```

**Note:** Use `+91` country code, not `9998471715` alone.

---

## 3. View all submissions (database)

### Option A — PostgreSQL (pgAdmin)

1. Open **pgAdmin** → database `ai_portfolio` → table `contacts`.
2. Right-click → **View/Edit Data** → see all rows.
3. Export: Right-click table → **Import/Export** → Export to **CSV** (opens in Excel).

### Option B — API JSON

```http
GET http://127.0.0.1:8000/contact
Header: X-Admin-Key: my-portfolio-admin-key-2026
```

Or browser extension / Postman.

### Option C — Download Excel-ready CSV

```http
GET http://127.0.0.1:8000/contact/export
Header: X-Admin-Key: my-portfolio-admin-key-2026
```

Opens in Excel. Set `ADMIN_API_KEY` in `.env` (already set in your file).

### Option D — SQL query

```sql
SELECT * FROM contacts ORDER BY created_at DESC;
```

Run in pgAdmin Query Tool.

---

## 4. Frontend display links (icons on Contact page)

Edit `frontend/.env`:

```env
VITE_CONTACT_EMAIL=meetchetanpura9@gmail.com
VITE_CONTACT_WHATSAPP=https://wa.me/919998471715
```

Restart `npm run dev`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Form works, no email | Set `MAIL_PASSWORD` to Gmail **App Password**, restart API |
| No SMS/WhatsApp | Add Twilio keys; trial account required |
| Email goes to spam | Mark as “Not spam”; use same address for MAIL_FROM and ADMIN_EMAIL |
