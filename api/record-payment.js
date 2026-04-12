import { getSql } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, leaseId, tenantUserId, amount, description, method } = req.body || {};
  if (!id || !leaseId || !tenantUserId || !amount || !description || !method) {
    return res.status(400).json({ error: "id, leaseId, tenantUserId, amount, description, and method are required." });
  }

  try {
    const sql = getSql();

    await sql`
      insert into payments (
        id,
        lease_id,
        tenant_user_id,
        amount_cents,
        description,
        method,
        status,
        paid_at
      )
      values (
        ${String(id)},
        ${String(leaseId)},
        ${String(tenantUserId)},
        ${Math.round(Number(amount) * 100)},
        ${String(description)},
        ${String(method)},
        'Paid',
        now()
      )
    `;

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to record payment."
    });
  }
}
