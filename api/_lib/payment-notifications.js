import nodemailer from "nodemailer";

const EMAIL_STATUS_SENT = "sent";
const EMAIL_STATUS_FAILED = "failed";

function getSmtpConfig() {
  const user = String(process.env.GMAIL_SMTP_EMAIL || "").trim();
  const pass = String(process.env.GMAIL_SMTP_APP_PASSWORD || "").trim();

  return { user, pass };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function formatCurrencyFromCents(amountCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(amountCents || 0) / 100);
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function buildPropertyLabel(property) {
  return [property.street, property.unit, `${property.city}, ${property.state} ${property.zip}`]
    .filter(Boolean)
    .join(", ");
}

function buildEmailText(details) {
  const remainingBalanceLine =
    typeof details.remainingBalanceCents === "number"
      ? `Remaining balance: ${formatCurrencyFromCents(details.remainingBalanceCents)}`
      : "Remaining balance: Not available";

  return [
    `Hello ${details.tenantName},`,
    "",
    "This is a confirmation that your rent payment has been received.",
    "",
    `Property / Unit: ${details.propertyLabel}`,
    `Payment amount: ${formatCurrencyFromCents(details.amountCents)}`,
    `Payment date: ${formatDateTime(details.paymentDate)}`,
    remainingBalanceLine,
    "",
    "Thank you. Your payment has been recorded successfully.",
    "",
    "CRH Condos"
  ].join("\n");
}

function buildEmailHtml(details) {
  const remainingBalanceLine =
    typeof details.remainingBalanceCents === "number"
      ? formatCurrencyFromCents(details.remainingBalanceCents)
      : "Not available";

  return `
    <div style="font-family: Arial, sans-serif; color: #153152; line-height: 1.6;">
      <p>Hello ${escapeHtml(details.tenantName)},</p>
      <p>This is a confirmation that your rent payment has been received.</p>
      <p>
        <strong>Property / Unit:</strong> ${escapeHtml(details.propertyLabel)}<br>
        <strong>Payment amount:</strong> ${escapeHtml(formatCurrencyFromCents(details.amountCents))}<br>
        <strong>Payment date:</strong> ${escapeHtml(formatDateTime(details.paymentDate))}<br>
        <strong>Remaining balance:</strong> ${escapeHtml(remainingBalanceLine)}
      </p>
      <p>Thank you. Your payment has been recorded successfully.</p>
      <p>CRH Condos</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function buildPaymentEmailDetails(sql, paymentId) {
  const rows = await sql`
    select
      p.id,
      p.amount_cents,
      p.paid_at,
      p.created_at,
      p.email_notification_status,
      u.first_name,
      u.last_name,
      u.email,
      l.id as lease_id,
      l.monthly_cost_cents,
      l.street,
      l.city,
      l.state,
      l.zip,
      l.unit
    from payments p
    join users u on u.id = p.tenant_user_id
    join leases l on l.id = p.lease_id
    where p.id = ${String(paymentId)}
    limit 1
  `;

  const payment = rows[0];
  if (!payment) return null;

  const paymentDate = payment.paid_at || payment.created_at;
  const periodRows = await sql`
    select coalesce(sum(amount_cents), 0) as total_paid_cents
    from payments
    where lease_id = ${payment.lease_id}
      and status = 'Paid'
      and date_trunc('month', coalesce(paid_at, created_at)) = date_trunc('month', ${paymentDate}::timestamptz)
  `;

  const totalPaidCents = Number(periodRows[0]?.total_paid_cents || 0);
  const remainingBalanceCents = Math.max(0, Number(payment.monthly_cost_cents || 0) - totalPaidCents);

  return {
    paymentId: payment.id,
    recipientEmail: String(payment.email || "").trim(),
    tenantName: `${payment.first_name} ${payment.last_name}`.trim(),
    propertyLabel: buildPropertyLabel(payment),
    amountCents: Number(payment.amount_cents || 0),
    paymentDate,
    remainingBalanceCents,
    emailNotificationStatus: payment.email_notification_status
  };
}

async function markEmailStatus(sql, paymentId, status, errorMessage = null) {
  await sql`
    update payments
    set
      email_notification_status = ${status},
      email_notification_sent_at = ${status === EMAIL_STATUS_SENT ? new Date().toISOString() : null},
      email_notification_error = ${errorMessage}
    where id = ${String(paymentId)}
  `;
}

export async function ensurePaymentNotificationSchema(sql) {
  await sql`
    alter table payments
    add column if not exists email_notification_status text
  `;
  await sql`
    alter table payments
    add column if not exists email_notification_sent_at timestamptz
  `;
  await sql`
    alter table payments
    add column if not exists email_notification_error text
  `;
}

export async function sendPaymentNotificationForPayment(sql, paymentId) {
  await ensurePaymentNotificationSchema(sql);

  const details = await buildPaymentEmailDetails(sql, paymentId);
  if (!details) {
    return {
      status: EMAIL_STATUS_FAILED,
      warning: "Payment saved, but notification email could not be sent."
    };
  }

  if (details.emailNotificationStatus === EMAIL_STATUS_SENT) {
    return { status: EMAIL_STATUS_SENT, warning: "" };
  }

  if (!isValidEmail(details.recipientEmail)) {
    await markEmailStatus(sql, details.paymentId, EMAIL_STATUS_FAILED, "Invalid tenant email format.");
    return {
      status: EMAIL_STATUS_FAILED,
      warning: "Payment saved, but notification email could not be sent."
    };
  }

  const smtpConfig = getSmtpConfig();
  if (!smtpConfig.user || !smtpConfig.pass) {
    await markEmailStatus(sql, details.paymentId, EMAIL_STATUS_FAILED, "Missing Gmail SMTP environment variables.");
    return {
      status: EMAIL_STATUS_FAILED,
      warning: "Payment saved, but notification email could not be sent."
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass
      }
    });

    await transporter.sendMail({
      from: smtpConfig.user,
      to: details.recipientEmail,
      subject: "Payment Received Confirmation",
      text: buildEmailText(details),
      html: buildEmailHtml(details)
    });

    await markEmailStatus(sql, details.paymentId, EMAIL_STATUS_SENT, null);
    return { status: EMAIL_STATUS_SENT, warning: "" };
  } catch (error) {
    await markEmailStatus(
      sql,
      details.paymentId,
      EMAIL_STATUS_FAILED,
      error instanceof Error ? error.message : "Unknown email delivery error."
    );
    return {
      status: EMAIL_STATUS_FAILED,
      warning: "Payment saved, but notification email could not be sent."
    };
  }
}
