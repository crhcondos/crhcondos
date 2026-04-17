import nodemailer from "nodemailer";

const EMAIL_STATUS_SENT = "sent";
const EMAIL_STATUS_FAILED = "failed";
const EMAIL_KIND_RECEIVED = "payment_received";
const EMAIL_KIND_PENDING = "payment_pending";

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

function buildReceivedEmailText(details) {
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

function buildReceivedEmailHtml(details) {
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

function buildPendingEmailText(details) {
  const remainingBalanceLine =
    typeof details.remainingBalanceCents === "number"
      ? `Remaining balance after this pending payment clears: ${formatCurrencyFromCents(details.remainingBalanceCents)}`
      : "Remaining balance after this pending payment clears: Not available";

  return [
    `Hello ${details.tenantName},`,
    "",
    "We received your payment request and it is currently scheduled or pending confirmation.",
    "Please note that this is not a final payment receipt yet.",
    "",
    `Property / Unit: ${details.propertyLabel}`,
    `Scheduled payment amount: ${formatCurrencyFromCents(details.amountCents)}`,
    `Submission date: ${formatDateTime(details.paymentDate)}`,
    remainingBalanceLine,
    "",
    "Once the payment fully clears, you will receive a separate confirmation email.",
    "",
    "CRH Condos"
  ].join("\n");
}

function buildPendingEmailHtml(details) {
  const remainingBalanceLine =
    typeof details.remainingBalanceCents === "number"
      ? formatCurrencyFromCents(details.remainingBalanceCents)
      : "Not available";

  return `
    <div style="font-family: Arial, sans-serif; color: #153152; line-height: 1.6;">
      <p>Hello ${escapeHtml(details.tenantName)},</p>
      <p>We received your payment request and it is currently scheduled or pending confirmation.</p>
      <p><strong>Please note:</strong> this is not a final payment receipt yet.</p>
      <p>
        <strong>Property / Unit:</strong> ${escapeHtml(details.propertyLabel)}<br>
        <strong>Scheduled payment amount:</strong> ${escapeHtml(formatCurrencyFromCents(details.amountCents))}<br>
        <strong>Submission date:</strong> ${escapeHtml(formatDateTime(details.paymentDate))}<br>
        <strong>Remaining balance after this pending payment clears:</strong> ${escapeHtml(remainingBalanceLine)}
      </p>
      <p>Once the payment fully clears, you will receive a separate confirmation email.</p>
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
      p.email_notification_kind,
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
    emailNotificationStatus: payment.email_notification_status,
    emailNotificationKind: String(payment.email_notification_kind || "").trim()
  };
}

async function markEmailStatus(sql, paymentId, status, kind, errorMessage = null) {
  await sql`
    update payments
    set
      email_notification_status = ${status},
      email_notification_kind = ${kind},
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
  await sql`
    alter table payments
    add column if not exists email_notification_kind text
  `;
}

function getNotificationContent(kind, details) {
  if (kind === EMAIL_KIND_PENDING) {
    return {
      subject: "Payment Submitted - Pending Confirmation",
      text: buildPendingEmailText(details),
      html: buildPendingEmailHtml(details)
    };
  }

  return {
    subject: "Payment Received Confirmation",
    text: buildReceivedEmailText(details),
    html: buildReceivedEmailHtml(details)
  };
}

export async function sendPaymentNotificationForPayment(sql, paymentId, options = {}) {
  await ensurePaymentNotificationSchema(sql);
  const notificationKind =
    options.kind === EMAIL_KIND_PENDING ? EMAIL_KIND_PENDING : EMAIL_KIND_RECEIVED;

  const details = await buildPaymentEmailDetails(sql, paymentId);
  if (!details) {
    return {
      status: EMAIL_STATUS_FAILED,
      warning: "Payment saved, but notification email could not be sent."
    };
  }

  if (
    details.emailNotificationStatus === EMAIL_STATUS_SENT &&
    details.emailNotificationKind === notificationKind
  ) {
    return { status: EMAIL_STATUS_SENT, warning: "" };
  }

  if (!isValidEmail(details.recipientEmail)) {
    await markEmailStatus(
      sql,
      details.paymentId,
      EMAIL_STATUS_FAILED,
      notificationKind,
      "Invalid tenant email format."
    );
    return {
      status: EMAIL_STATUS_FAILED,
      warning: "Payment saved, but notification email could not be sent."
    };
  }

  const smtpConfig = getSmtpConfig();
  if (!smtpConfig.user || !smtpConfig.pass) {
    await markEmailStatus(
      sql,
      details.paymentId,
      EMAIL_STATUS_FAILED,
      notificationKind,
      "Missing Gmail SMTP environment variables."
    );
    return {
      status: EMAIL_STATUS_FAILED,
      warning: "Payment saved, but notification email could not be sent."
    };
  }

  try {
    const content = getNotificationContent(notificationKind, details);
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
      subject: content.subject,
      text: content.text,
      html: content.html
    });

    await markEmailStatus(sql, details.paymentId, EMAIL_STATUS_SENT, notificationKind, null);
    return { status: EMAIL_STATUS_SENT, warning: "" };
  } catch (error) {
    await markEmailStatus(
      sql,
      details.paymentId,
      EMAIL_STATUS_FAILED,
      notificationKind,
      error instanceof Error ? error.message : "Unknown email delivery error."
    );
    return {
      status: EMAIL_STATUS_FAILED,
      warning: "Payment saved, but notification email could not be sent."
    };
  }
}

export const paymentNotificationKinds = {
  received: EMAIL_KIND_RECEIVED,
  pending: EMAIL_KIND_PENDING
};
