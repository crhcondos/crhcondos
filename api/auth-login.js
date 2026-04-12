import bcrypt from "bcryptjs";
import { getSql } from "./_lib/db.js";
import { loadSessionData } from "./_lib/load-session-data.js";
import { setSessionCookie } from "./_lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, role } = req.body || {};
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and role are required." });
  }

  try {
    const sql = getSql();

    const users = await sql`
      select id, role, first_name, last_name, phone, email, password_hash
      from users
      where lower(email) = lower(${String(email)})
        and role = ${String(role)}
      limit 1
    `;

    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const data = await loadSessionData(sql, user.id, user.role);
    setSessionCookie(res, { userId: user.id, role: user.role });

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
      error: error instanceof Error ? error.message : "Unable to log in."
    });
  }
}
