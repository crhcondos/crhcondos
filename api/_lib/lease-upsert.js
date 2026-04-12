import bcrypt from "bcryptjs";

export async function upsertLease(sql, payload) {
  const tenantEmail = String(payload.principalTenant.email).trim().toLowerCase();

  const existingTenantByEmail = await sql`
    select id, role
    from users
    where lower(email) = ${tenantEmail}
    limit 1
  `;

  let tenantUserId = payload.principalTenantUserId || existingTenantByEmail[0]?.id || payload.tenantUserId;
  if (!tenantUserId) {
    tenantUserId = payload.tenantUserId;
  }

  const passwordHash = await bcrypt.hash(String(payload.password), 10);

  await sql`
    insert into users (
      id, role, first_name, last_name, phone, email, password_hash
    )
    values (
      ${tenantUserId},
      'tenant',
      ${String(payload.principalTenant.firstName)},
      ${String(payload.principalTenant.lastName)},
      ${String(payload.principalTenant.phone)},
      ${tenantEmail},
      ${passwordHash}
    )
    on conflict (id) do update set
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      phone = excluded.phone,
      email = excluded.email,
      password_hash = excluded.password_hash,
      updated_at = now()
  `;

  await sql`
    insert into leases (
      id,
      principal_tenant_user_id,
      status,
      start_date,
      end_date,
      monthly_cost_cents,
      deposit_made_cents,
      street,
      city,
      state,
      zip,
      unit,
      parking_spaces
    )
    values (
      ${payload.id},
      ${tenantUserId},
      ${String(payload.terms.status)},
      ${String(payload.terms.startDate)},
      ${String(payload.terms.endDate)},
      ${Math.round(Number(payload.terms.monthlyCost) * 100)},
      ${Math.round(Number(payload.terms.depositMade) * 100)},
      ${String(payload.property.street)},
      ${String(payload.property.city)},
      ${String(payload.property.state)},
      ${String(payload.property.zip)},
      ${String(payload.property.unit)},
      ${String(payload.property.parkingSpaces || "")}
    )
    on conflict (id) do update set
      principal_tenant_user_id = excluded.principal_tenant_user_id,
      status = excluded.status,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      monthly_cost_cents = excluded.monthly_cost_cents,
      deposit_made_cents = excluded.deposit_made_cents,
      street = excluded.street,
      city = excluded.city,
      state = excluded.state,
      zip = excluded.zip,
      unit = excluded.unit,
      parking_spaces = excluded.parking_spaces,
      updated_at = now()
  `;

  await sql`delete from lease_derivatives where lease_id = ${payload.id}`;
  if (payload.derivatives?.length) {
    for (const derivative of payload.derivatives) {
      await sql`
        insert into lease_derivatives (id, lease_id, first_name, last_name)
        values (
          ${String(derivative.id)},
          ${payload.id},
          ${String(derivative.firstName)},
          ${String(derivative.lastName)}
        )
      `;
    }
  }

  await sql`delete from lease_other_payments where lease_id = ${payload.id}`;
  if (payload.terms.otherPayments?.length) {
    for (const payment of payload.terms.otherPayments) {
      await sql`
        insert into lease_other_payments (id, lease_id, amount_cents, description)
        values (
          ${String(payment.id)},
          ${payload.id},
          ${Math.round(Number(payment.amount) * 100)},
          ${String(payment.description)}
        )
      `;
    }
  }

  return { tenantUserId };
}
