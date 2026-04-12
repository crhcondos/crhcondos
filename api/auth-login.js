import bcrypt from "bcryptjs";
import { getSql } from "./_lib/db.js";
import { shapeAppData } from "./_lib/shape-data.js";

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

    const visibleUsers =
      user.role === "admin"
        ? await sql`
            select id, role, first_name, last_name, phone, email
            from users
            order by created_at asc
          `
        : await sql`
            select id, role, first_name, last_name, phone, email
            from users
            where id = ${user.id}
          `;

    const leases =
      user.role === "admin"
        ? await sql`
            select
              l.*,
              u.first_name,
              u.last_name,
              u.phone,
              u.email
            from leases l
            join users u on u.id = l.principal_tenant_user_id
            order by l.start_date desc
          `
        : await sql`
            select
              l.*,
              u.first_name,
              u.last_name,
              u.phone,
              u.email
            from leases l
            join users u on u.id = l.principal_tenant_user_id
            where l.principal_tenant_user_id = ${user.id}
            order by l.start_date desc
          `;

    const leaseIds = leases.map((row) => row.id);
    const scopedLeaseIds = leaseIds.length ? leaseIds : ["__none__"];

    const leaseDerivatives = await sql`
      select id, lease_id, first_name, last_name
      from lease_derivatives
      where lease_id = any(${scopedLeaseIds})
      order by first_name asc, last_name asc
    `;

    const leaseOtherPayments = await sql`
      select id, lease_id, amount_cents, description
      from lease_other_payments
      where lease_id = any(${scopedLeaseIds})
      order by id asc
    `;

    const payments =
      user.role === "admin"
        ? await sql`
            select id, lease_id, tenant_user_id, amount_cents, description, method, status, paid_at, created_at
            from payments
            order by created_at desc
          `
        : await sql`
            select id, lease_id, tenant_user_id, amount_cents, description, method, status, paid_at, created_at
            from payments
            where tenant_user_id = ${user.id}
            order by created_at desc
          `;

    const tickets =
      user.role === "admin"
        ? await sql`
            select id, lease_id, tenant_user_id, nature, description, status, created_at
            from tickets
            order by created_at desc
          `
        : await sql`
            select id, lease_id, tenant_user_id, nature, description, status, created_at
            from tickets
            where tenant_user_id = ${user.id}
            order by created_at desc
          `;

    return res.status(200).json({
      user: {
        id: user.id,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        email: user.email
      },
      data: shapeAppData({
        users: visibleUsers,
        leases,
        leaseDerivatives,
        leaseOtherPayments,
        payments,
        tickets,
        stripe: {
          mode: process.env.STRIPE_MODE === "live" ? "live" : "demo",
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
          checkoutEndpoint: "/api/create-checkout-session"
        }
      })
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to log in."
    });
  }
}
