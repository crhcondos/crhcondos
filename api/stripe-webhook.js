import Stripe from "stripe";

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
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // TODO: Replace this with database writes.
      // Persist a payment row and tie it to the lease/tenant IDs in metadata.
      console.log("checkout.session.completed", {
        sessionId: session.id,
        leaseId: session.metadata?.leaseId,
        tenantUserId: session.metadata?.tenantUserId,
        amountTotal: session.amount_total
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(
      error instanceof Error ? `Webhook error: ${error.message}` : "Webhook error"
    );
  }
}
