import { shapeAppData } from "./shape-data.js";
import { ensureAutopaySchema } from "./autopay.js";

export async function loadSessionData(sql, userId, role) {
  await ensureAutopaySchema(sql);

  const users =
    role === "admin"
      ? await sql`
          select id, role, first_name, last_name, phone, email
          from users
          order by created_at asc
        `
      : await sql`
          select id, role, first_name, last_name, phone, email
          from users
          where id = ${userId}
        `;

  const leases =
    role === "admin"
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
          where l.principal_tenant_user_id = ${userId}
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
    role === "admin"
      ? await sql`
          select id, lease_id, tenant_user_id, stripe_subscription_id, amount_cents, description, method, status, email_notification_status, email_notification_sent_at, email_notification_error, paid_at, created_at
          from payments
          order by created_at desc
        `
      : await sql`
          select id, lease_id, tenant_user_id, stripe_subscription_id, amount_cents, description, method, status, email_notification_status, email_notification_sent_at, email_notification_error, paid_at, created_at
          from payments
          where tenant_user_id = ${userId}
          order by created_at desc
        `;

  const tickets =
    role === "admin"
      ? await sql`
          select id, lease_id, tenant_user_id, nature, description, status, created_at
          from tickets
          order by created_at desc
        `
      : await sql`
          select id, lease_id, tenant_user_id, nature, description, status, created_at
          from tickets
          where tenant_user_id = ${userId}
          order by created_at desc
        `;

  const autopays =
    role === "admin"
      ? await sql`
          select
            id,
            lease_id,
            tenant_user_id,
            stripe_subscription_id,
            amount_cents,
            description,
            first_charge_date,
            stop_mode,
            stop_date,
            status,
            created_at,
            updated_at,
            canceled_at
          from autopay_enrollments
          order by created_at desc
        `
      : await sql`
          select
            id,
            lease_id,
            tenant_user_id,
            stripe_subscription_id,
            amount_cents,
            description,
            first_charge_date,
            stop_mode,
            stop_date,
            status,
            created_at,
            updated_at,
            canceled_at
          from autopay_enrollments
          where tenant_user_id = ${userId}
          order by created_at desc
        `;

  return shapeAppData({
    users,
    leases,
    leaseDerivatives,
    leaseOtherPayments,
    payments,
    tickets,
    autopays,
    stripe: {
      mode: process.env.STRIPE_MODE === "live" ? "live" : "demo",
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      checkoutEndpoint: "/api/create-checkout-session"
    }
  });
}
