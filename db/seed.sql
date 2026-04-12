create extension if not exists pgcrypto;

insert into users (id, role, first_name, last_name, phone, email, password_hash)
values
  (
    'user-admin-1',
    'admin',
    'Coastal',
    'Manager',
    '(555) 210-4400',
    'admin@crhcondos.com',
    crypt('admin123', gen_salt('bf'))
  ),
  (
    'user-tenant-1',
    'tenant',
    'Mia',
    'Santos',
    '(555) 101-9921',
    'mia@crhcondos.com',
    crypt('tenant123', gen_salt('bf'))
  ),
  (
    'user-tenant-2',
    'tenant',
    'Julian',
    'Brooks',
    '(555) 202-4471',
    'julian@crhcondos.com',
    crypt('tenant123', gen_salt('bf'))
  )
on conflict (id) do nothing;

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
values
  (
    'lease-seed-1',
    'user-tenant-1',
    'Active',
    '2026-01-01',
    '2026-12-31',
    295000,
    295000,
    '144 Oceanview Blvd',
    'Long Beach',
    'CA',
    '90802',
    'Unit 2A',
    '310, 311'
  ),
  (
    'lease-seed-2',
    'user-tenant-2',
    'Inactive',
    '2025-03-01',
    '2026-03-31',
    322500,
    322500,
    '98 Harbor Crest Dr',
    'Long Beach',
    'CA',
    '90803',
    'Unit 5C',
    '112'
  )
on conflict (id) do nothing;

insert into lease_derivatives (id, lease_id, first_name, last_name)
values
  ('der-seed-1', 'lease-seed-1', 'Leo', 'Santos')
on conflict (id) do nothing;

insert into lease_other_payments (id, lease_id, amount_cents, description)
values
  ('other-seed-1', 'lease-seed-1', 25000, 'Pet deposit')
on conflict (id) do nothing;

insert into payments (
  id,
  lease_id,
  tenant_user_id,
  amount_cents,
  description,
  method,
  status,
  paid_at
)
values
  (
    'pay-seed-1',
    'lease-seed-1',
    'user-tenant-1',
    295000,
    'April rent',
    'ACH via Stripe',
    'Paid',
    '2026-04-01T00:00:00Z'
  ),
  (
    'pay-seed-2',
    'lease-seed-1',
    'user-tenant-1',
    295000,
    'March rent',
    'Card via Stripe',
    'Paid',
    '2026-03-01T00:00:00Z'
  ),
  (
    'pay-seed-3',
    'lease-seed-2',
    'user-tenant-2',
    322500,
    'Final rent cycle',
    'Card via Stripe',
    'Paid',
    '2026-03-01T00:00:00Z'
  )
on conflict (id) do nothing;

insert into tickets (
  id,
  lease_id,
  tenant_user_id,
  nature,
  description,
  status,
  created_at
)
values
  (
    'ticket-seed-1',
    'lease-seed-1',
    'user-tenant-1',
    'Air Conditioning',
    'The bedroom vent is blowing warm air after 7pm and the room does not cool down.',
    'Open',
    '2026-04-08T00:00:00Z'
  ),
  (
    'ticket-seed-2',
    'lease-seed-2',
    'user-tenant-2',
    'Plumbing',
    'Kitchen sink is draining slowly even after basic cleaning.',
    'Closed',
    '2026-03-15T00:00:00Z'
  )
on conflict (id) do nothing;
