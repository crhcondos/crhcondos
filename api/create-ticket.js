import { getSql } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, leaseId, tenantUserId, nature, description } = req.body || {};
  if (!id || !leaseId || !tenantUserId || !nature || !description) {
    return res.status(400).json({ error: "id, leaseId, tenantUserId, nature, and description are required." });
  }

  try {
    const sql = getSql();

    await sql`
      insert into tickets (id, lease_id, tenant_user_id, nature, description, status)
      values (
        ${String(id)},
        ${String(leaseId)},
        ${String(tenantUserId)},
        ${String(nature)},
        ${String(description)},
        'Open'
      )
    `;

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to create ticket."
    });
  }
}
