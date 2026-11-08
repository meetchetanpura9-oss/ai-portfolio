# Contact notifications setup

> **Recommended:** Use **Excel CSV** + PostgreSQL — see `DATA_EXPORT.md` (no Twilio required).

When a visitor submits the contact form:

| Channel | Destination |
|---------|-------------|
| **Excel CSV** | `backend/data/contact_submissions.csv` (automatic) |
| **PostgreSQL** | Table `contacts` in `ai_portfolio` |
| **Email** (optional) | meetchetanpura9@gmail.com — Gmail App Password in `.env` |
| **WhatsApp** | Your WhatsApp — full inquiry details (CallMeBot free, or Twilio) |
| **SMS** (optional) | Twilio — skip if not needed |

---

## 0. WhatsApp alert (recommended: CallMeBot — free)

Every submission sends you a WhatsApp message with the name, email, phone, company,
service (including custom services typed by the visitor) and the full message.

1. Save the CallMeBot WhatsApp number shown on
   https://www.callmebot.com/blog/free-api-whatsapp-messages/ in your phone contacts.
2. From your WhatsApp, send it: `I allow callmebot to send me messages`
3. You will receive an API key. Add to `backend/.env` (and to Render → Environment):

```env
CALLMEBOT_PHONE=+919998471715
CALLMEBOT_APIKEY=1234567
```

4. Restart the API and submit the contact form to test.

Prefer Twilio instead? Leave the CallMeBot keys empty and set `TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` and `ADMIN_PHONE_WHATSAPP` (see section 2).
If WhatsApp is not configured the form still works — the alert is simply skipped and logged.

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
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
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
