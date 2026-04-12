import { getSql } from "./_lib/db.js";
import { upsertLease } from "./_lib/lease-upsert.js";
import { requireRole } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = requireRole(req, res, "admin");
  if (!session) return;

  const payload = req.body || {};
  if (!payload.id || !payload.principalTenant?.email || !payload.password) {
    return res.status(400).json({ error: "Lease id, principal tenant email, and password are required." });
  }

  try {
    const sql = getSql();
    const result = await upsertLease(sql, payload);
    return res.status(200).json({ ok: true, tenantUserId: result.tenantUserId });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to save lease."
    });
  }
}
