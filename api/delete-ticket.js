import { getSql } from "./_lib/db.js";
import { requireRole } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = requireRole(req, res, "admin");
  if (!session) return;

  const { ticketId } = req.body || {};
  if (!ticketId) {
    return res.status(400).json({ error: "ticketId is required." });
  }

  try {
    const sql = getSql();
    await sql`delete from tickets where id = ${String(ticketId)}`;
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to delete ticket."
    });
  }
}
