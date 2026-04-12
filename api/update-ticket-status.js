import { getSql } from "./_lib/db.js";
import { requireRole } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = requireRole(req, res, "admin");
  if (!session) return;

  const { ticketId, status } = req.body || {};
  if (!ticketId || !status) {
    return res.status(400).json({ error: "ticketId and status are required." });
  }

  if (!["Open", "Closed"].includes(String(status))) {
    return res.status(400).json({ error: "Invalid ticket status." });
  }

  try {
    const sql = getSql();

    await sql`
      update tickets
      set status = ${String(status)}, updated_at = now()
      where id = ${String(ticketId)}
    `;

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to update ticket status."
    });
  }
}
