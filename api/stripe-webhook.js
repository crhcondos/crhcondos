import Stripe from "stripe";
import { getSql } from "./_lib/db.js";
import { upsertCheckoutPayment } from "./_lib/stripe-checkout-payment.js";
import {
  ensureAutopaySchema,
  updateAutopayStatus,
  upsertAutopayEnrollment,
  upsertAutopayPayment
} from "./_lib/autopay.js";

function endOfDateUnix(dateString) {
  const [year, month, day] = String(dateString || "").split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid date.");
  }
  return Math.floor(Date.UTC(year, month - 1, day, 23, 59, 59) / 1000);
}

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
    await ensureAutopaySchema(sql);
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.mode === "subscription" && session.subscription) {
        const stopDate = String(session.metadata?.stopDate || "").trim();
        if (stopDate) {
          await stripe.subscriptions.update(String(session.subscription), {
            cancel_at: endOfDateUnix(stopDate)
          });
        }
        const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
        await upsertAutopayEnrollment(sql, session, subscription);
      } else {
        await upsertCheckoutPayment(sql, session);
      }
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      await upsertCheckoutPayment(sql, session, "Paid");
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(String(invoice.subscription));
        await upsertAutopayPayment(sql, invoice, subscription);
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(String(invoice.subscription));
        await updateAutopayStatus(sql, {
          ...subscription,
          status: "past_due"
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await updateAutopayStatus(sql, {
        ...subscription,
        status: "canceled"
      });
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      await updateAutopayStatus(sql, subscription);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(
      error instanceof Error ? `Webhook error: ${error.message}` : "Webhook error"
    );
  }
}
