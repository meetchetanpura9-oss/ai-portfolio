# Admin Database Guide

This project saves every Contact Us form submission in PostgreSQL, sends email notifications, and also appends a CSV backup.

## Admin Browser Page

Start the backend, then open:

```text
http://127.0.0.1:8000/admin/contacts?admin_key=my-portfolio-admin-key-2026
```

This shows all client messages from the database.

## Download Excel CSV

```text
http://127.0.0.1:8000/contact/export?admin_key=my-portfolio-admin-key-2026
```

## JSON API

Use Postman, Thunder Client, or another API tool:

```http
GET http://127.0.0.1:8000/contact
X-Admin-Key: my-portfolio-admin-key-2026
```

Optional pagination:

```text
http://127.0.0.1:8000/contact?skip=0&limit=100
```

## PostgreSQL Query

In pgAdmin Query Tool:

```sql
SELECT
  id,
  full_name,
  email,
  phone,
  company,
  service,
  message,
  created_at
FROM contacts
ORDER BY created_at DESC;
```

## Traffic Notes

- Multiple visitors can open the website at the same time.
- Each contact submission uses its own database session and commits safely.
- PostgreSQL connection pooling is enabled with:

```env
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
```

This allows up to 30 active database connections from the API process during traffic spikes.

For heavier production traffic, deploy the backend with multiple workers and move rate limiting to Redis.
