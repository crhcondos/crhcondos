# CRH Condos

CRH Condos is a polished static prototype for Coastal Rise Holdings LLC. It includes:

- A welcome page with separate tenant and property manager login paths
- A manager portal for lease creation, editing, deletion, payment history, reports, and ticket handling
- A tenant portal for profile updates, lease review, payment history, payment posting, and maintenance tickets
- A Stripe-ready payment area that uses demo mode in this prototype

## Open the app

1. Open [index.html](C:\Users\Karel\Documents\New project\index.html) in a browser.
2. Use one of these demo accounts:
   - `admin@crhcondos.com` / `admin123`
   - `mia@crhcondos.com` / `tenant123`
   - `julian@crhcondos.com` / `tenant123`

All app data is stored in `localStorage`, so changes persist in the browser until cleared.

## Reset demo data

Open the browser console and run:

```js
resetCRHCondosDemo();
```

## Stripe production wiring

This prototype follows the recommended direction from current Stripe guidance: use Checkout Sessions for on-session rent payments.

The tenant payment screen currently runs in demo mode and records a local payment entry. To go live:

1. Build a backend endpoint at `POST /api/create-checkout-session`
2. Create a Stripe Checkout Session server-side
3. Return the Checkout URL or Session ID
4. Redirect the tenant to Stripe Checkout from the frontend
5. Confirm the payment with a webhook before marking it paid in your database

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

## Files

- [index.html](C:\Users\Karel\Documents\New project\index.html)
- [styles.css](C:\Users\Karel\Documents\New project\styles.css)
- [app.js](C:\Users\Karel\Documents\New project\app.js)
