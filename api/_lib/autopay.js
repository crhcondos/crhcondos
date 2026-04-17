import {
  paymentNotificationKinds,
  sendPaymentNotificationForPayment
} from "./payment-notifications.js";

export async function ensureAutopaySchema(sql) {
  await sql`
    alter table users
    add column if not exists stripe_customer_id text
  `;
  await sql`
    create unique index if not exists idx_users_stripe_customer_id
    on users(stripe_customer_id)
    where stripe_customer_id is not null
  `;

  await sql`
    create table if not exists autopay_enrollments (
      id text primary key,
      lease_id text not null references leases(id) on delete cascade,
      tenant_user_id text not null references users(id) on delete cascade,
      stripe_customer_id text,
      stripe_subscription_id text unique,
      stripe_checkout_session_id text unique,
      amount_cents integer not null check (amount_cents >= 0),
      description text not null,
      first_charge_date date not null,
      stop_mode text not null check (stop_mode in ('specific_date', 'lease_end')),
      stop_date date,
      status text not null check (status in ('Pending', 'Active', 'PastDue', 'Canceled', 'Ended')),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      canceled_at timestamptz
    )
  `;
  await sql`
    create index if not exists idx_autopay_enrollments_lease_id
    on autopay_enrollments(lease_id)
  `;
  await sql`
    create index if not exists idx_autopay_enrollments_tenant_user_id
    on autopay_enrollments(tenant_user_id)
  `;

  await sql`
    alter table payments
    add column if not exists stripe_invoice_id text
  `;
  await sql`
    alter table payments
    add column if not exists stripe_subscription_id text
  `;
  await sql`
    create unique index if not exists idx_payments_stripe_invoice_id
    on payments(stripe_invoice_id)
    where stripe_invoice_id is not null
  `;
}

export function toDateOnly(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function dateToUnixMidday(dateString) {
  const [year, month, day] = String(dateString || "").split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid date.");
  }
  return Math.floor(Date.UTC(year, month - 1, day, 12, 0, 0) / 1000);
}

export function endOfDateUnix(dateString) {
  const [year, month, day] = String(dateString || "").split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid date.");
  }
  return Math.floor(Date.UTC(year, month - 1, day, 23, 59, 59) / 1000);
}

export async function upsertAutopayEnrollment(sql, session, subscription) {
  const subscriptionId =
    typeof session?.subscription === "string"
      ? session.subscription
      : String(session?.subscription?.id || subscription?.id || "").trim();
  const leaseId = String(subscription?.metadata?.leaseId || session?.metadata?.leaseId || "").trim();
  const tenantUserId = String(subscription?.metadata?.tenantUserId || session?.metadata?.tenantUserId || "").trim();
  const description = String(subscription?.metadata?.description || session?.metadata?.description || "Monthly rent autopay").trim();
  const amountCents = Number(subscription?.metadata?.amountCents || session?.metadata?.amountCents || 0);
  const firstChargeDate = String(subscription?.metadata?.firstChargeDate || session?.metadata?.firstChargeDate || "").trim();
  const stopMode = String(subscription?.metadata?.stopMode || session?.metadata?.stopMode || "").trim();
  const stopDate = String(subscription?.metadata?.stopDate || session?.metadata?.stopDate || "").trim() || null;

  if (!leaseId || !tenantUserId || !subscriptionId || !firstChargeDate || !stopMode) {
    throw new Error("Missing autopay metadata.");
  }

  const status = mapSubscriptionStatus(subscription?.status, firstChargeDate);

  await sql`
    insert into autopay_enrollments (
      id,
      lease_id,
      tenant_user_id,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_checkout_session_id,
      amount_cents,
      description,
      first_charge_date,
      stop_mode,
      stop_date,
      status,
      updated_at,
      canceled_at
    )
    values (
      ${`autopay_${subscriptionId}`},
      ${leaseId},
      ${tenantUserId},
      ${session.customer ? String(session.customer) : null},
      ${subscriptionId},
      ${String(session.id)},
      ${amountCents},
      ${description},
      ${firstChargeDate},
      ${stopMode},
      ${stopDate},
      ${status},
      now(),
      ${status === "Canceled" || status === "Ended" ? new Date().toISOString() : null}
    )
    on conflict (stripe_subscription_id) do update
    set
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_checkout_session_id = excluded.stripe_checkout_session_id,
      amount_cents = excluded.amount_cents,
      description = excluded.description,
      first_charge_date = excluded.first_charge_date,
      stop_mode = excluded.stop_mode,
      stop_date = excluded.stop_date,
      status = excluded.status,
      updated_at = now(),
      canceled_at = excluded.canceled_at
  `;
}

export async function upsertAutopayPayment(sql, invoice, subscription) {
  const leaseId = String(subscription?.metadata?.leaseId || "").trim();
  const tenantUserId = String(subscription?.metadata?.tenantUserId || "").trim();
  const description = String(subscription?.metadata?.description || "Monthly rent autopay").trim();
  const subscriptionId = String(invoice.subscription || subscription?.id || "").trim();
  const invoiceId = String(invoice.id || "").trim();

  if (!leaseId || !tenantUserId || !subscriptionId || !invoiceId) {
    throw new Error("Missing recurring payment metadata.");
  }

  const invoiceStatus = invoice.status === "paid" || invoice.paid ? "Paid" : "Pending";
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(Number(invoice.status_transitions.paid_at) * 1000).toISOString()
    : (invoiceStatus === "Paid" ? new Date().toISOString() : null);

  const paymentId = `pay_invoice_${invoiceId}`;

  await sql`
    insert into payments (
      id,
      lease_id,
      tenant_user_id,
      stripe_invoice_id,
      stripe_subscription_id,
      amount_cents,
      description,
      method,
      status,
      paid_at
    )
    values (
      ${paymentId},
      ${leaseId},
      ${tenantUserId},
      ${invoiceId},
      ${subscriptionId},
      ${Number(invoice.amount_paid || invoice.amount_due || 0)},
      ${description},
      ${"Autopay via Stripe"},
      ${invoiceStatus},
      ${paidAt}
    )
    on conflict (stripe_invoice_id) do update
    set
      amount_cents = excluded.amount_cents,
      description = excluded.description,
      method = excluded.method,
      status = excluded.status,
      paid_at = excluded.paid_at,
      stripe_subscription_id = excluded.stripe_subscription_id
  `;

  await sql`
    update autopay_enrollments
    set
      status = ${mapSubscriptionStatus(subscription?.status, subscription?.metadata?.firstChargeDate)},
      updated_at = now()
    where stripe_subscription_id = ${subscriptionId}
  `;

  if (invoiceStatus === "Paid") {
    await sendPaymentNotificationForPayment(sql, paymentId, {
      kind: paymentNotificationKinds.received
    });
  }
}

export async function updateAutopayStatus(sql, subscription) {
  const subscriptionId = String(subscription?.id || "").trim();
  if (!subscriptionId) {
    throw new Error("Missing subscription id.");
  }

  let nextStatus = mapSubscriptionStatus(subscription.status, subscription.metadata?.firstChargeDate);
  if (nextStatus === "Canceled") {
    const rows = await sql`
      select stop_date
      from autopay_enrollments
      where stripe_subscription_id = ${subscriptionId}
      limit 1
    `;
    const stopDate = toDateOnly(rows[0]?.stop_date);
    if (stopDate && stopDate <= new Date().toISOString().slice(0, 10)) {
      nextStatus = "Ended";
    }
  }

  await sql`
    update autopay_enrollments
    set
      status = ${nextStatus},
      updated_at = now(),
      canceled_at = ${nextStatus === "Canceled" || nextStatus === "Ended" ? new Date().toISOString() : null}
    where stripe_subscription_id = ${subscriptionId}
  `;
}

function mapSubscriptionStatus(status, firstChargeDate) {
  if (status === "canceled" || status === "incomplete_expired" || status === "unpaid") {
    return "Canceled";
  }
  if (status === "past_due") {
    return "PastDue";
  }
  if (status === "trialing") {
    return "Pending";
  }
  if (status === "active") {
    const today = new Date().toISOString().slice(0, 10);
    return firstChargeDate && firstChargeDate > today ? "Pending" : "Active";
  }
  return "Pending";
}
