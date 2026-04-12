export async function upsertCheckoutPayment(sql, session, statusOverride) {
  const leaseId = String(session.metadata?.leaseId || "").trim();
  const tenantUserId = String(session.metadata?.tenantUserId || "").trim();
  const description = String(session.metadata?.description || "Rent payment").trim();

  if (!session.id || !leaseId || !tenantUserId) {
    throw new Error("Missing required checkout session metadata.");
  }

  const leaseRows = await sql`
    select id
    from leases
    where id = ${leaseId}
      and principal_tenant_user_id = ${tenantUserId}
    limit 1
  `;

  if (!leaseRows.length) {
    throw new Error("The Stripe payment does not match a valid tenant lease.");
  }

  const paymentStatus =
    statusOverride || (session.payment_status === "paid" ? "Paid" : "Pending");

  await sql`
    insert into payments (
      id,
      lease_id,
      tenant_user_id,
      stripe_checkout_session_id,
      amount_cents,
      description,
      method,
      status,
      paid_at
    )
    values (
      ${`pay_${session.id}`},
      ${leaseId},
      ${tenantUserId},
      ${String(session.id)},
      ${Number(session.amount_total || 0)},
      ${description},
      ${"Card via Stripe Checkout"},
      ${paymentStatus},
      ${paymentStatus === "Paid" ? new Date().toISOString() : null}
    )
    on conflict (stripe_checkout_session_id) do update
    set
      amount_cents = excluded.amount_cents,
      description = excluded.description,
      method = excluded.method,
      status = excluded.status,
      paid_at = excluded.paid_at
  `;

  return {
    leaseId,
    tenantUserId,
    status: paymentStatus
  };
}
