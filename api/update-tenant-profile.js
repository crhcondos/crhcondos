import bcrypt from "bcryptjs";
import { getSql } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, email, phone, password } = req.body || {};
  if (!userId || !email || !phone || !password) {
    return res.status(400).json({ error: "userId, email, phone, and password are required." });
  }

  try {
    const sql = getSql();
    const passwordHash = await bcrypt.hash(String(password), 10);

    await sql`
      update users
      set
        email = ${String(email)},
        phone = ${String(phone)},
        password_hash = ${passwordHash},
        updated_at = now()
      where id = ${String(userId)}
        and role = 'tenant'
    `;

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to update tenant profile."
    });
  }
}
