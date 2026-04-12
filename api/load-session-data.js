import { getSql } from "./_lib/db.js";
import { requireSession } from "./_lib/session.js";
import { loadSessionData } from "./_lib/load-session-data.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

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
