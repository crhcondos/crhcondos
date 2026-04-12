import { getSql } from "./_lib/db.js";
import { loadSessionData } from "./_lib/load-session-data.js";
import { clearSessionCookie, requireSession } from "./_lib/session.js";
import { upsertCheckoutPayment } from "./_lib/stripe-checkout-payment.js";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover"
    })
  : null;

export default async function handler(req, res) {
  if (req.method === "GET") {
    const session = requireSession(req, res);
    if (!session) return;

    try {
      const sql = getSql();
      const users = await sql`
        select id, role, first_name, last_name, phone, email
        from users
        where id = ${String(session.userId)}
        limit 1
      `;

      const user = users[0];
      if (!user) {
        return res.status(401).json({ error: "Your session is no longer valid." });
      }

      const data = await loadSessionData(sql, user.id, user.role);

      return res.status(200).json({
        user: {
          id: user.id,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          email: user.email
        },
        data
      });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unable to restore session."
      });
    }
  }

  if (req.method === "POST") {
    const { action } = req.body || {};

    if (action === "logout") {
      clearSessionCookie(res);
      return res.status(200).json({ ok: true });
    }

    if (action === "load") {
      const session = requireSession(req, res);
      if (!session) return;

      try {
        const sql = getSql();
        return res.status(200).json({
          data: await loadSessionData(sql, session.userId, session.role)
        });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to load session data."
        });
      }
    }

    if (action === "confirm-payment") {
      const session = requireSession(req, res);
      if (!session) return;

      const sessionId = String(req.body?.sessionId || "").trim();
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required." });
      }

      if (!stripe) {
        return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY." });
      }

      try {
        const sql = getSql();
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

        if (String(checkoutSession.metadata?.tenantUserId || "") !== String(session.userId)) {
          return res.status(403).json({ error: "This payment does not belong to the current session." });
        }

        const payment = await upsertCheckoutPayment(sql, checkoutSession);
        return res.status(200).json({ ok: true, payment });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to confirm Stripe payment."
        });
      }
    }

    return res.status(400).json({ error: "Invalid session action." });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
