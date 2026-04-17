create table users (
  id text primary key,
  role text not null check (role in ('admin', 'tenant')),
  first_name text not null,
  last_name text not null,
  phone text,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table leases (
  id text primary key,
  principal_tenant_user_id text not null references users(id) on delete cascade,
  status text not null check (status in ('Active', 'Inactive')),
  start_date date not null,
  end_date date not null,
  monthly_cost_cents integer not null check (monthly_cost_cents >= 0),
  deposit_made_cents integer not null check (deposit_made_cents >= 0),
  street text not null,
  city text not null,
  state text not null,
  zip text not null,
  unit text not null,
  parking_spaces text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lease_derivatives (
  id text primary key,
  lease_id text not null references leases(id) on delete cascade,
  first_name text not null,
  last_name text not null
);

create table lease_other_payments (
  id text primary key,
  lease_id text not null references leases(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  description text not null
);

create table payments (
  id text primary key,
  lease_id text not null references leases(id) on delete cascade,
  tenant_user_id text not null references users(id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_invoice_id text unique,
  stripe_subscription_id text,
  amount_cents integer not null check (amount_cents >= 0),
  description text not null,
  method text not null,
  status text not null check (status in ('Pending', 'Paid', 'Failed')),
  email_notification_status text,
  email_notification_sent_at timestamptz,
  email_notification_error text,
  email_notification_kind text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table tickets (
  id text primary key,
  lease_id text not null references leases(id) on delete cascade,
  tenant_user_id text not null references users(id) on delete cascade,
  nature text not null,
  description text not null,
  status text not null check (status in ('Open', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lease_documents (
  id text primary key,
  lease_id text not null references leases(id) on delete cascade,
  file_name text not null,
  mime_type text not null default 'application/pdf',
  content_base64 text not null,
  created_at timestamptz not null default now()
);

create table autopay_enrollments (
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
);

create index idx_leases_principal_tenant_user_id on leases(principal_tenant_user_id);
create index idx_payments_lease_id on payments(lease_id);
create index idx_payments_tenant_user_id on payments(tenant_user_id);
create index idx_tickets_lease_id on tickets(lease_id);
create index idx_tickets_tenant_user_id on tickets(tenant_user_id);
create index idx_lease_documents_lease_id on lease_documents(lease_id);
create index idx_autopay_enrollments_lease_id on autopay_enrollments(lease_id);
create index idx_autopay_enrollments_tenant_user_id on autopay_enrollments(tenant_user_id);
