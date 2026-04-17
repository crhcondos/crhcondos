import { getSql } from "./_lib/db.js";
import { sendPaymentNotificationForPayment } from "./_lib/payment-notifications.js";
import { requireRole } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = requireRole(req, res, "tenant");
  if (!session) return;

  const { id, amount, description, method } = req.body || {};
  if (!id || !amount || !description || !method) {
    return res.status(400).json({ error: "id, amount, description, and method are required." });
  }

  try {
    const sql = getSql();
    const leases = await sql`
      select id
      from leases
      where principal_tenant_user_id = ${String(session.userId)}
      limit 1
    `;

    const leaseId = leases[0]?.id;
    if (!leaseId) {
      return res.status(400).json({ error: "No lease is attached to this tenant account." });
    }

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
        ${String(session.userId)},
        ${Math.round(Number(amount) * 100)},
        ${String(description)},
        ${String(method)},
        'Paid',
        now()
      )
    `;

    const notificationResult = await sendPaymentNotificationForPayment(sql, String(id));

    return res.status(200).json({
      ok: true,
      warning: notificationResult.warning || ""
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to record payment."
    });
  }
}
