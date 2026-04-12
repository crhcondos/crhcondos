import { getSql } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { leaseId } = req.body || {};
  if (!leaseId) {
    return res.status(400).json({ error: "leaseId is required." });
  }

  try {
    const sql = getSql();
    const rows = await sql`
      select principal_tenant_user_id
      from leases
      where id = ${String(leaseId)}
      limit 1
    `;

    const tenantUserId = rows[0]?.principal_tenant_user_id || null;

    await sql`delete from leases where id = ${String(leaseId)}`;

    if (tenantUserId) {
      const remainingLeases = await sql`
        select id
        from leases
        where principal_tenant_user_id = ${tenantUserId}
        limit 1
      `;

      if (!remainingLeases.length) {
        await sql`delete from users where id = ${tenantUserId}`;
      }
    }

    return res.status(200).json({ ok: true, tenantUserId });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to delete lease."
    });
  }
}
