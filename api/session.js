import { getSql } from "./_lib/db.js";
import { loadSessionData } from "./_lib/load-session-data.js";
import { clearSessionCookie, requireSession } from "./_lib/session.js";
import { upsertCheckoutPayment } from "./_lib/stripe-checkout-payment.js";
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

    return res.status(400).json({ error: "Invalid session action." });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
