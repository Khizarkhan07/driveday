import { BRAND_NAME } from "@motorcover/shared-types";

// ---------------------------------------------------------------------------
// Shared layout
// ---------------------------------------------------------------------------

function layout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0c1e;font-family:-apple-system,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0c1e;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo header -->
        <tr>
          <td style="padding:0 0 24px 0;text-align:center;">
            <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.05em;">DAY <span style="color:#70ed9b;">DRIVE</span></span>
            <div style="font-size:10px;color:#4a4d63;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">AUTO INSURANCE</div>
          </td>
        </tr>

        <!-- Body card -->
        <tr>
          <td style="background:#1d1e2c;border:1px solid #2d3047;border-radius:16px;overflow:hidden;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0 0 0;text-align:center;">
            <p style="font-size:11px;color:#4a4d63;margin:0 0 4px 0;">${BRAND_NAME} · Underwritten by Highway Insurance Company Limited</p>
            <p style="font-size:11px;color:#4a4d63;margin:0;">Authorised and regulated by the Financial Conduct Authority</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Policy confirmation
// ---------------------------------------------------------------------------

export function renderPolicyConfirmationEmail(input: {
  firstName: string | null;
  policyNumber: string;
  registration: string;
  vehicleMakeModel: string;
  startDate: string;
  endDate: string;
  totalPence: number;
  portalUrl: string;
}): string {
  const name = escapeHtml(input.firstName ?? "there");
  const amount = `£${(input.totalPence / 100).toFixed(2)}`;
  const startD = new Date(input.startDate);
  const endD = new Date(input.endDate);

  const startDateFmt = startD.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const startTimeFmt = startD.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const endDateFmt   = endD.toLocaleDateString("en-GB",   { day: "2-digit", month: "2-digit", year: "numeric" });
  const endTimeFmt   = endD.toLocaleTimeString("en-GB",   { hour: "2-digit", minute: "2-digit" });

  const body = `
    <!-- Green hero banner -->
    <div style="background:linear-gradient(135deg,#1c9456 0%,#3ddc81 100%);padding:32px 36px;">
      <h1 style="margin:0 0 8px 0;font-size:26px;font-weight:900;color:#0b0c1e;line-height:1.2;">
        You're covered,<br>be on your way! 🚗
      </h1>
      <p style="margin:0;font-size:14px;color:#0b0c1e;opacity:0.8;">Your 1-day policy is confirmed and active</p>
    </div>

    <!-- Greeting -->
    <div style="padding:28px 36px 0 36px;">
      <p style="margin:0 0 8px 0;font-size:15px;color:#e4e6ee;">Hey there, <strong style="color:#ffffff;">${name}</strong>,</p>
      <p style="margin:0;font-size:14px;color:#9598ab;line-height:1.6;">
        Great news! Your Day Drive policy for <strong style="color:#ffffff;">${escapeHtml(input.vehicleMakeModel)}</strong>
        with registration <strong style="color:#70ed9b;">${escapeHtml(input.registration)}</strong> is officially confirmed.
        Your policy documents are attached to this email.
      </p>
    </div>

    <!-- Policy details table -->
    <div style="padding:24px 36px;">
      <div style="background:#181926;border:1px solid #2d3047;border-radius:12px;overflow:hidden;">
        <div style="background:#2d3047;padding:12px 20px;">
          <span style="font-size:11px;font-weight:700;color:#9598ab;letter-spacing:0.12em;text-transform:uppercase;">Policy Details</span>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${row("Registration",  `<strong style="color:#70ed9b;letter-spacing:0.1em;">${escapeHtml(input.registration)}</strong>`)}
          ${row("Policy No.",    escapeHtml(input.policyNumber))}
          ${row("Start Date",    startDateFmt)}
          ${row("Start Time",    startTimeFmt)}
          ${row("End Date",      endDateFmt)}
          ${row("End Time",      endTimeFmt)}
          ${row("Policy Term",   "1 Day")}
          ${row("Total Paid",    `<strong style="color:#70ed9b;font-size:16px;">${amount}</strong>`, true)}
        </table>
      </div>
    </div>

    <!-- Provider info -->
    <div style="padding:0 36px 24px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#4a4d63;">
        Insurance Provider: <strong style="color:#9598ab;">Highway Insurance Company Limited</strong>
      </p>
    </div>

    <!-- Important documents -->
    <div style="padding:0 36px 28px 36px;">
      <div style="background:#181926;border:1px solid #2d3047;border-radius:12px;padding:20px;">
        <div style="margin-bottom:16px;">
          <span style="font-size:11px;font-weight:700;color:#9598ab;letter-spacing:0.12em;text-transform:uppercase;">📎 Your documents are attached</span>
        </div>
        <p style="margin:0 0 12px 0;font-size:13px;color:#9598ab;line-height:1.5;">
          The following documents are attached to this email as PDF files:
        </p>
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          ${docRow("🏅", "Certificate of Motor Insurance")}
          ${docRow("📋", "Policy Schedule")}
          ${docRow("📄", "Statement of Fact")}
          ${docRow("📖", "Policy Wording")}
          ${docRow("📝", "Terms of Business")}
        </table>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #2d3047;">
          <p style="margin:0 0 12px 0;font-size:12px;color:#4a4d63;">
            You can also view and download your documents any time from your portal:
          </p>
          <a href="${escapeHtml(input.portalUrl)}"
             style="display:inline-block;background:#70ed9b;color:#0b0c1e;font-size:13px;font-weight:800;padding:12px 24px;border-radius:100px;text-decoration:none;">
            View my portal →
          </a>
        </div>
      </div>
    </div>
  `;

  return layout(body);
}

// ---------------------------------------------------------------------------
// Signup confirmation
// ---------------------------------------------------------------------------

export function renderSignupConfirmationEmail(input: { firstName: string | null }): string {
  const name = escapeHtml(input.firstName ?? "there");

  const body = `
    <div style="background:linear-gradient(135deg,#1c9456 0%,#3ddc81 100%);padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:900;color:#0b0c1e;">Welcome to Day Drive 👋</h1>
    </div>
    <div style="padding:28px 36px;">
      <p style="margin:0 0 12px 0;font-size:15px;color:#e4e6ee;">Hi <strong style="color:#ffffff;">${name}</strong>,</p>
      <p style="margin:0 0 16px 0;font-size:14px;color:#9598ab;line-height:1.6;">
        Your Day Drive account is all set. You can now get instant 1-day car insurance quotes and access all your policy documents in one place.
      </p>
      <p style="margin:0;font-size:12px;color:#4a4d63;">If you didn't create this account, please ignore this email.</p>
    </div>
  `;

  return layout(body);
}

// ---------------------------------------------------------------------------
// Quote saved
// ---------------------------------------------------------------------------

export function renderQuoteSavedEmail(input: {
  firstName: string | null;
  registration: string;
  totalPence: number;
  resumeUrl: string;
}): string {
  const name = escapeHtml(input.firstName ?? "there");
  const amount = `£${(input.totalPence / 100).toFixed(2)}`;

  const body = `
    <div style="background:linear-gradient(135deg,#1c9456 0%,#3ddc81 100%);padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:900;color:#0b0c1e;">Your quote is saved 💾</h1>
    </div>
    <div style="padding:28px 36px;">
      <p style="margin:0 0 12px 0;font-size:15px;color:#e4e6ee;">Hi <strong style="color:#ffffff;">${name}</strong>,</p>
      <p style="margin:0 0 20px 0;font-size:14px;color:#9598ab;line-height:1.6;">
        Your quote for <strong style="color:#ffffff;">${escapeHtml(input.registration)}</strong>
        at <strong style="color:#70ed9b;">${amount}</strong> has been saved.
        Come back any time to complete your purchase.
      </p>
      <a href="${escapeHtml(input.resumeUrl)}"
         style="display:inline-block;background:#70ed9b;color:#0b0c1e;font-size:13px;font-weight:800;padding:12px 24px;border-radius:100px;text-decoration:none;">
        Resume my quote →
      </a>
    </div>
  `;

  return layout(body);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function row(label: string, value: string, last = false): string {
  return `<tr>
    <td style="padding:12px 20px;font-size:12px;color:#4a4d63;white-space:nowrap;border-bottom:${last ? "none" : "1px solid #2d3047"};">${label}</td>
    <td style="padding:12px 20px;font-size:13px;color:#e4e6ee;text-align:right;border-bottom:${last ? "none" : "1px solid #2d3047"};">${value}</td>
  </tr>`;
}

function docRow(icon: string, label: string): string {
  return `<tr>
    <td style="padding:6px 0;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:16px;">${icon}</span>
        <span style="font-size:13px;color:#e4e6ee;">${label}</span>
      </div>
    </td>
    <td style="text-align:right;padding:6px 0;">
      <span style="font-size:11px;font-weight:700;color:#70ed9b;background:#70ed9b18;padding:3px 8px;border-radius:100px;">Attached</span>
    </td>
  </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
