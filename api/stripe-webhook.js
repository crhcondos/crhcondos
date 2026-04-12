import Stripe from "stripe";
import { getSql } from "./_lib/db.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover"
    })
  : null;

async function readRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false
  }
};

async function upsertCheckoutPayment(sql, session, statusOverride) {
  const leaseId = String(session.metadata?.leaseId || "").trim();
  const tenantUserId = String(session.metadata?.tenantUserId || "").trim();
  const description = String(session.metadata?.description || "Rent payment").trim();

  if (!session.id || !leaseId || !tenantUserId) {
    throw new Error("Missing required checkout session metadata.");
  }

  const leaseRows = await sql`
    select id
    from leases
    where id = ${leaseId}
      and principal_tenant_user_id = ${tenantUserId}
    limit 1
  `;

  if (!leaseRows.length) {
    throw new Error("The Stripe payment does not match a valid tenant lease.");
  }

  const paymentStatus =
    statusOverride || (session.payment_status === "paid" ? "Paid" : "Pending");

  await sql`
    insert into payments (
      id,
      lease_id,
      tenant_user_id,
      stripe_checkout_session_id,
      amount_cents,
      description,
      method,
      status,
      paid_at
    )
    values (
      ${`pay_${session.id}`},
      ${leaseId},
      ${tenantUserId},
      ${String(session.id)},
      ${Number(session.amount_total || 0)},
      ${description},
      ${"Card via Stripe Checkout"},
      ${paymentStatus},
      ${paymentStatus === "Paid" ? new Date().toISOString() : null}
    )
    on conflict (stripe_checkout_session_id) do update
    set
      amount_cents = excluded.amount_cents,
      description = excluded.description,
      method = excluded.method,
      status = excluded.status,
      paid_at = excluded.paid_at
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method not allowed");
  }

  if (!stripe) {
    return res.status(500).send("Missing STRIPE_SECRET_KEY.");
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET.");
  }

  try {
    const sql = getSql();
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await upsertCheckoutPayment(sql, session);
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      await upsertCheckoutPayment(sql, session, "Paid");
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(
      error instanceof Error ? `Webhook error: ${error.message}` : "Webhook error"
    );
  }
}
