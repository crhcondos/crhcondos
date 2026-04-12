import { getSql } from "./_lib/db.js";
import { loadSessionData } from "./_lib/load-session-data.js";
import { requireSession } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

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
