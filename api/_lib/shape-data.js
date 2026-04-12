export function shapeAppData({
  users,
  leases,
  leaseDerivatives,
  leaseOtherPayments,
  payments,
  tickets,
  stripe
}) {
  const derivativeMap = new Map();
  const otherPaymentsMap = new Map();

  leaseDerivatives.forEach((row) => {
    const list = derivativeMap.get(row.lease_id) || [];
    list.push({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name
    });
    derivativeMap.set(row.lease_id, list);
  });

  leaseOtherPayments.forEach((row) => {
    const list = otherPaymentsMap.get(row.lease_id) || [];
    list.push({
      id: row.id,
      amount: Number(row.amount_cents) / 100,
      description: row.description
    });
    otherPaymentsMap.set(row.lease_id, list);
  });

  return {
    users: users.map((row) => ({
      id: row.id,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      email: row.email,
      password: "",
      leaseId: null
    })),
    leases: leases.map((row) => ({
      id: row.id,
      principalTenantUserId: row.principal_tenant_user_id,
      principalTenant: {
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        email: row.email
      },
      derivatives: derivativeMap.get(row.id) || [],
      property: {
        street: row.street,
        city: row.city,
        state: row.state,
        zip: row.zip,
        unit: row.unit,
        parkingSpaces: row.parking_spaces || ""
      },
      terms: {
        status: row.status,
        startDate: formatDateOnly(row.start_date),
        endDate: formatDateOnly(row.end_date),
        monthlyCost: Number(row.monthly_cost_cents) / 100,
        depositMade: Number(row.deposit_made_cents) / 100,
        otherPayments: otherPaymentsMap.get(row.id) || []
      }
    })),
    payments: payments.map((row) => ({
      id: row.id,
      leaseId: row.lease_id,
      tenantUserId: row.tenant_user_id,
      date: formatDateOnly(row.paid_at || row.created_at),
      amount: Number(row.amount_cents) / 100,
      method: row.method,
      description: row.description,
      status: row.status
    })),
    tickets: tickets.map((row) => ({
      id: row.id,
      leaseId: row.lease_id,
      tenantUserId: row.tenant_user_id,
      nature: row.nature,
      description: row.description,
      status: row.status,
      createdAt: formatDateOnly(row.created_at)
    })),
    stripe
  };
}

function formatDateOnly(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}
