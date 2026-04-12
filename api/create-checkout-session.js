import Stripe from "stripe";
import { getSql } from "./_lib/db.js";
import { requireRole } from "./_lib/session.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover"
    })
  : null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (process.env.STRIPE_MODE !== "live") {
    return res.status(400).json({ error: "Stripe live mode is not enabled." });
  }

  if (!stripe) {
    return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY." });
  }

  const userSession = requireRole(req, res, "tenant");
  if (!userSession) return;

  const { amount, description } = req.body || {};
  if (!amount || !description) {
    return res.status(400).json({ error: "amount and description are required." });
  }

  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    return res.status(500).json({ error: "Missing APP_URL." });
  }

  try {
    const sql = getSql();
    const leases = await sql`
      select id
      from leases
      where principal_tenant_user_id = ${String(userSession.userId)}
      limit 1
    `;

    const leaseId = leases[0]?.id;
    if (!leaseId) {
      return res.status(400).json({ error: "No lease is attached to this tenant account." });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${appUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?payment=cancelled`,
      billing_address_collection: "auto",
      metadata: {
        leaseId: String(leaseId),
        tenantUserId: String(userSession.userId),
        description: String(description)
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Number(amount),
            product_data: {
              name: "CRH Condos Rent Payment",
              description: String(description)
            }
          }
        }
      ]
    });

    return res.status(200).json({
      id: checkoutSession.id,
      url: checkoutSession.url
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to create Stripe Checkout Session."
    });
  }
}
