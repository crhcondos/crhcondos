import { getSql } from "./_lib/db.js";
import { loadSessionData } from "./_lib/load-session-data.js";
import { clearSessionCookie, requireSession } from "./_lib/session.js";
import { upsertCheckoutPayment } from "./_lib/stripe-checkout-payment.js";
import {
  dateToUnixMidday,
  endOfDateUnix,
  ensureAutopaySchema,
  toDateOnly,
  upsertAutopayEnrollment
} from "./_lib/autopay.js";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover"
    })
  : null;

async function ensureLeaseDocumentsTable(sql) {
  await sql`
    create table if not exists lease_documents (
      id text primary key,
      lease_id text not null references leases(id) on delete cascade,
      file_name text not null,
      mime_type text not null default 'application/pdf',
      content_base64 text not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists idx_lease_documents_lease_id on lease_documents(lease_id)`;
}

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

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
        return res.status(200).json({
          ok: true,
          payment,
          warning: payment.warning || ""
        });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to confirm Stripe payment."
        });
      }
    }

    if (action === "start-autopay") {
      const session = requireSession(req, res);
      if (!session) return;
      if (session.role !== "tenant") {
        return res.status(403).json({ error: "You do not have access to this action." });
      }

      if (process.env.STRIPE_MODE !== "live") {
        return res.status(400).json({ error: "Stripe live mode is not enabled." });
      }

      if (!stripe) {
        return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY." });
      }

      const amountCents = Number(req.body?.amountCents || 0);
      const description = String(req.body?.description || "").trim();
      const firstChargeDate = String(req.body?.firstChargeDate || "").trim();
      const stopMode = String(req.body?.stopMode || "").trim();
      const stopDateInput = String(req.body?.stopDate || "").trim();

      if (!amountCents || !description || !firstChargeDate || !stopMode) {
        return res.status(400).json({
          error: "amountCents, description, firstChargeDate, and stopMode are required."
        });
      }

      if (!["specific_date", "lease_end"].includes(stopMode)) {
        return res.status(400).json({ error: "Invalid stopMode." });
      }

      try {
        const sql = getSql();
        await ensureAutopaySchema(sql);

        const leaseRows = await sql`
          select
            l.id,
            l.end_date,
            l.monthly_cost_cents,
            u.id as user_id,
            u.email,
            u.first_name,
            u.last_name,
            u.stripe_customer_id
          from leases l
          join users u on u.id = l.principal_tenant_user_id
          where l.principal_tenant_user_id = ${String(session.userId)}
          limit 1
        `;

        const lease = leaseRows[0];
        if (!lease) {
          return res.status(400).json({ error: "No lease is attached to this tenant account." });
        }

        const resolvedStopDate = stopMode === "lease_end" ? toDateOnly(lease.end_date) : stopDateInput;
        if (!resolvedStopDate) {
          return res.status(400).json({ error: "A stop date is required for this autopay setup." });
        }

        if (firstChargeDate < todayDateOnly()) {
          return res.status(400).json({ error: "The first autopay date cannot be in the past." });
        }

        if (resolvedStopDate < firstChargeDate) {
          return res.status(400).json({ error: "The autopay stop date must be on or after the first charge date." });
        }

        if (resolvedStopDate > toDateOnly(lease.end_date)) {
          return res.status(400).json({ error: "The autopay stop date cannot be after the lease end date." });
        }

        const existingAutopay = await sql`
          select id
          from autopay_enrollments
          where lease_id = ${lease.id}
            and tenant_user_id = ${String(session.userId)}
            and status in ('Pending', 'Active', 'PastDue')
          limit 1
        `;

        if (existingAutopay.length) {
          return res.status(400).json({ error: "An active autopay schedule already exists for this lease." });
        }

        let stripeCustomerId = lease.stripe_customer_id ? String(lease.stripe_customer_id) : "";
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: String(lease.email),
            name: `${lease.first_name} ${lease.last_name}`.trim(),
            metadata: {
              tenantUserId: String(session.userId),
              leaseId: String(lease.id)
            }
          });
          stripeCustomerId = customer.id;

          await sql`
            update users
            set stripe_customer_id = ${stripeCustomerId}
            where id = ${String(session.userId)}
          `;
        }

        const appUrl = process.env.APP_URL;
        if (!appUrl) {
          return res.status(500).json({ error: "Missing APP_URL." });
        }

        const subscriptionData = {
          metadata: {
            leaseId: String(lease.id),
            tenantUserId: String(session.userId),
            description,
            amountCents: String(amountCents),
            firstChargeDate,
            stopMode,
            stopDate: resolvedStopDate
          }
        };

        if (firstChargeDate > todayDateOnly()) {
          subscriptionData.billing_cycle_anchor = dateToUnixMidday(firstChargeDate);
          subscriptionData.proration_behavior = "none";
        }

        const checkoutSession = await stripe.checkout.sessions.create({
          mode: "subscription",
          customer: stripeCustomerId,
          success_url: `${appUrl}/?autopay=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/?autopay=cancelled`,
          billing_address_collection: "auto",
          metadata: {
            leaseId: String(lease.id),
            tenantUserId: String(session.userId),
            description,
            amountCents: String(amountCents),
            firstChargeDate,
            stopMode,
            stopDate: resolvedStopDate
          },
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: amountCents,
                recurring: {
                  interval: "month"
                },
                product_data: {
                  name: "CRH Condos Autopay",
                  description
                }
              }
            }
          ],
          subscription_data: subscriptionData
        });

        return res.status(200).json({
          id: checkoutSession.id,
          url: checkoutSession.url
        });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to start autopay setup."
        });
      }
    }

    if (action === "confirm-autopay") {
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
        await ensureAutopaySchema(sql);

        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["subscription"]
        });

        if (String(checkoutSession.metadata?.tenantUserId || "") !== String(session.userId)) {
          return res.status(403).json({ error: "This autopay setup does not belong to the current session." });
        }

        if (!checkoutSession.subscription || typeof checkoutSession.subscription === "string") {
          return res.status(400).json({ error: "The autopay subscription is still being prepared." });
        }

        await stripe.subscriptions.update(String(checkoutSession.subscription.id), {
          cancel_at: endOfDateUnix(String(checkoutSession.metadata?.stopDate || ""))
        });

        await upsertAutopayEnrollment(sql, checkoutSession, checkoutSession.subscription);
        return res.status(200).json({ ok: true });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to confirm autopay setup."
        });
      }
    }

    if (action === "cancel-autopay") {
      const session = requireSession(req, res);
      if (!session) return;

      const autopayId = String(req.body?.autopayId || "").trim();
      if (!autopayId) {
        return res.status(400).json({ error: "autopayId is required." });
      }

      if (!stripe) {
        return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY." });
      }

      try {
        const sql = getSql();
        await ensureAutopaySchema(sql);
        const rows = await sql`
          select id, tenant_user_id, stripe_subscription_id
          from autopay_enrollments
          where id = ${autopayId}
          limit 1
        `;

        const autopay = rows[0];
        if (!autopay) {
          return res.status(404).json({ error: "Autopay enrollment not found." });
        }

        if (session.role !== "admin" && String(autopay.tenant_user_id) !== String(session.userId)) {
          return res.status(403).json({ error: "You do not have access to this action." });
        }

        if (autopay.stripe_subscription_id) {
          await stripe.subscriptions.cancel(String(autopay.stripe_subscription_id));
        }

        await sql`
          update autopay_enrollments
          set
            status = 'Canceled',
            updated_at = now(),
            canceled_at = now()
          where id = ${autopayId}
        `;

        return res.status(200).json({ ok: true });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to cancel autopay."
        });
      }
    }

    if (action === "list-lease-documents") {
      const session = requireSession(req, res);
      if (!session) return;
      if (session.role !== "admin") {
        return res.status(403).json({ error: "You do not have access to this action." });
      }

      const leaseId = String(req.body?.leaseId || "").trim();
      if (!leaseId) {
        return res.status(400).json({ error: "leaseId is required." });
      }

      try {
        const sql = getSql();
        await ensureLeaseDocumentsTable(sql);
        const docs = await sql`
          select id, file_name, mime_type, created_at
          from lease_documents
          where lease_id = ${leaseId}
          order by created_at desc
        `;
        return res.status(200).json({
          docs: docs.map((doc) => ({
            id: doc.id,
            fileName: doc.file_name,
            mimeType: doc.mime_type,
            createdAt: doc.created_at
          }))
        });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to load lease documents."
        });
      }
    }

    if (action === "upload-lease-document") {
      const session = requireSession(req, res);
      if (!session) return;
      if (session.role !== "admin") {
        return res.status(403).json({ error: "You do not have access to this action." });
      }

      const leaseId = String(req.body?.leaseId || "").trim();
      const fileName = String(req.body?.fileName || "").trim();
      const mimeType = String(req.body?.mimeType || "").trim();
      const contentBase64 = String(req.body?.contentBase64 || "").trim();

      if (!leaseId || !fileName || !mimeType || !contentBase64) {
        return res.status(400).json({ error: "leaseId, fileName, mimeType, and contentBase64 are required." });
      }

      if (mimeType !== "application/pdf") {
        return res.status(400).json({ error: "Only PDF files are allowed." });
      }

      try {
        const sql = getSql();
        await ensureLeaseDocumentsTable(sql);
        const leaseRows = await sql`
          select id
          from leases
          where id = ${leaseId}
          limit 1
        `;

        if (!leaseRows.length) {
          return res.status(404).json({ error: "Lease not found." });
        }

        await sql`
          insert into lease_documents (id, lease_id, file_name, mime_type, content_base64)
          values (${`doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`}, ${leaseId}, ${fileName}, ${mimeType}, ${contentBase64})
        `;

        return res.status(200).json({ ok: true });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to upload lease document."
        });
      }
    }

    if (action === "open-lease-document") {
      const session = requireSession(req, res);
      if (!session) return;
      if (session.role !== "admin") {
        return res.status(403).json({ error: "You do not have access to this action." });
      }

      const documentId = String(req.body?.documentId || "").trim();
      if (!documentId) {
        return res.status(400).json({ error: "documentId is required." });
      }

      try {
        const sql = getSql();
        await ensureLeaseDocumentsTable(sql);
        const docs = await sql`
          select id, file_name, mime_type, content_base64, created_at
          from lease_documents
          where id = ${documentId}
          limit 1
        `;

        const doc = docs[0];
        if (!doc) {
          return res.status(404).json({ error: "Document not found." });
        }

        return res.status(200).json({
          document: {
            id: doc.id,
            fileName: doc.file_name,
            mimeType: doc.mime_type,
            contentBase64: doc.content_base64,
            createdAt: doc.created_at
          }
        });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to open lease document."
        });
      }
    }

    if (action === "delete-lease-document") {
      const session = requireSession(req, res);
      if (!session) return;
      if (session.role !== "admin") {
        return res.status(403).json({ error: "You do not have access to this action." });
      }

      const documentId = String(req.body?.documentId || "").trim();
      if (!documentId) {
        return res.status(400).json({ error: "documentId is required." });
      }

      try {
        const sql = getSql();
        await ensureLeaseDocumentsTable(sql);
        await sql`
          delete from lease_documents
          where id = ${documentId}
        `;

        return res.status(200).json({ ok: true });
      } catch (error) {
        return res.status(500).json({
          error: error instanceof Error ? error.message : "Unable to delete lease document."
        });
      }
    }

    return res.status(400).json({ error: "Invalid session action." });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
