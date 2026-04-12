# CRH Condos

CRH Condos is a polished prototype for Coastal Rise Holdings LLC. It includes:

- A welcome page with separate tenant and property manager login paths
- A manager portal for lease creation, editing, deletion, payment history, reports, and ticket handling
- A tenant portal for profile updates, lease review, payment history, payment posting, and maintenance tickets
- A Stripe-ready payment area that uses demo mode until Vercel environment variables enable live checkout

## Open the app

1. Open [index.html](C:\Users\Karel\Documents\New project\index.html) in a browser.
2. Use one of these demo accounts:
   - `admin@crhcondos.com` / `admin123`
   - `mia@crhcondos.com` / `tenant123`
   - `julian@crhcondos.com` / `tenant123`

Current limitation: the app now uses Neon/Postgres for login plus the main lease, ticket, payment, and tenant-profile flows, but the frontend still keeps UI state in `localStorage`. That means the browser is no longer the source of truth for the core records, yet the session/auth model still needs more hardening before real tenant use.

## Reset demo data

Open the browser console and run:

```js
resetCRHCondosDemo();
```

## Production foundation added

This repo now includes:

- `api/public-config.js` to expose safe runtime config from Vercel
- `api/auth-login.js` to authenticate against Neon/Postgres
- `api/restore-session.js` and `api/logout-session.js` for signed server-session cookies
- `api/create-checkout-session.js` to create Stripe Checkout Sessions
- `api/update-tenant-profile.js` to persist tenant profile edits
- `api/create-ticket.js`, `api/update-ticket-status.js`, and `api/delete-ticket.js` for ticket writes
- `api/record-payment.js` to persist demo-mode payment records in Postgres
- `api/save-lease.js` and `api/delete-lease.js` for admin lease CRUD writes
- `api/stripe-webhook.js` to verify Stripe webhook signatures
- `db/schema.sql` with a starter Postgres schema
- `db/seed.sql` with starter demo data for the database
- `.env.example` with the environment variables needed on Vercel

Add `SESSION_SECRET` in Vercel before relying on the signed session cookie in production. If it is missing, the server currently falls back to `POSTGRES_PASSWORD` so the app can still boot, but an explicit session secret is the recommended setup.

## Stripe production wiring

This prototype follows the recommended direction from current Stripe guidance: use Checkout Sessions for on-session rent payments.

The tenant payment screen currently runs in demo mode and records a local payment entry. To go live:

1. Set the Vercel environment variables from `.env.example`
2. Set `STRIPE_MODE=live`
3. Add your live Stripe keys
4. Configure a Stripe webhook to call `/api/stripe-webhook`
5. Replace the webhook `TODO` with database writes
6. Replace browser `localStorage` login/data with authenticated server APIs and Postgres

Recommended payload shape:

```json
{
  "leaseId": "lease_123",
  "tenantUserId": "user_123",
  "amount": 295000,
  "description": "April rent"
}
```

Important notes:

- Amounts sent to Stripe should use minor units, so `$2,950.00` becomes `295000`
- The latest Stripe API version referenced by the skill used for this build is `2026-02-25.clover`
- For production, replace browser `localStorage` with a real database plus authenticated server APIs
- The frontend now attempts a real Checkout redirect automatically when `STRIPE_MODE=live`

## Remaining production blockers

The app is still not production-ready for real tenants until these are completed:

- Hardened session storage and authorization beyond the current signed-cookie flow
- Webhook persistence so Stripe payments are recorded in the database
- Admin and tenant edit flows fully removed from browser-managed state

## Files

- [index.html](C:\Users\Karel\Documents\New project\index.html)
- [styles.css](C:\Users\Karel\Documents\New project\styles.css)
- [app.js](C:\Users\Karel\Documents\New project\app.js)
