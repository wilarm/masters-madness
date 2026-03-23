import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = process.env.EMAIL_FROM ?? "Masters Madness <noreply@emails.mastersmadness.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mastersmadness.com";

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Masters Madness</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#1a4731;padding:24px 32px;border-radius:8px 8px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#c9a84c;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Masters Madness</span>
                    <div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:4px;font-family:Georgia,serif;">April 9–12, 2026</div>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:#c9a84c20;border:1px solid #c9a84c40;border-radius:50%;width:40px;height:40px;line-height:40px;text-align:center;font-size:20px;">⛳</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-radius:0 0 8px 8px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 0;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                <a href="${APP_URL}" style="color:#1a4731;text-decoration:none;">mastersmadness.com</a>
                &nbsp;·&nbsp;
                Augusta National Golf Club&nbsp;·&nbsp;April 2026
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#1a4731;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:8px;">${text}</a>`;
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;font-family:Georgia,serif;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`;
}

// ─── Pool Created (Commissioner) ──────────────────────────────────────────────

type PoolCreatedInput = {
  to: string;
  displayName: string;
  poolName: string;
  poolSlug: string;
  entryFee?: number | null;
  venmoLink?: string | null;
  maxEntries?: number | null;
};

export async function sendPoolCreated({
  to,
  displayName,
  poolName,
  poolSlug,
  entryFee,
  venmoLink,
  maxEntries,
}: PoolCreatedInput) {
  const joinUrl = `${APP_URL}/pool/${poolSlug}`;

  const entryFeeNote = entryFee
    ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Entry Fee</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">$${entryFee} per person</td>
      </tr>`
    : `<tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Entry Fee</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">Free</td>
      </tr>`;

  const maxEntriesNote = maxEntries
    ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Max Entries</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">${maxEntries}</td>
      </tr>`
    : "";

  const venmoNote = entryFee && venmoLink
    ? `<p style="margin:0 0 8px;font-size:13px;color:#374151;">💸 <strong>Payment:</strong> Direct members to pay via <a href="${venmoLink}" style="color:#1a4731;">${venmoLink}</a></p>`
    : "";

  const body = `
    ${h1(`Your pool is live! 🏆`)}
    ${p(`Hey ${displayName}, <strong>${poolName}</strong> is all set up and ready for members. Share the link below to invite your friends.`)}

    <!-- Pool details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Pool Name</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">${poolName}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Tournament</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">2026 Masters · Apr 9–12</td>
      </tr>
      ${entryFeeNote}
      ${maxEntriesNote}
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Picks Lock</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;text-align:right;">April 9 at 5:00 AM MT</td>
      </tr>
    </table>

    <!-- Forward-friendly invite block -->
    <div style="background:#f0faf4;border:2px dashed #1a4731;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1a4731;">✉️ Forward this email to invite friends</p>
      <p style="margin:0 0 12px;font-size:13px;color:#374151;">Anyone with this link can join <strong>${poolName}</strong> and submit their picks for the Masters.</p>
      <a href="${joinUrl}" style="display:inline-block;background:#1a4731;color:#ffffff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:6px;text-decoration:none;letter-spacing:0.01em;">Join ${poolName} →</a>
      <p style="margin:12px 0 0;font-size:11px;color:#6b7280;word-break:break-all;">${joinUrl}</p>
    </div>

    ${venmoNote}
    ${p("As commissioner, you can manage members, send announcements, and update pool settings at any time.")}
    ${btn("Manage Your Pool", `${APP_URL}/pool/${poolSlug}`)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#9ca3af;">You created ${poolName} on Masters Madness. Questions? Reply to this email.</p>
  `;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `🏆 ${poolName} is live — share this link with friends`,
    html: layout(body),
  });
}

// ─── Pick Confirmation ─────────────────────────────────────────────────────────

type PickConfirmationInput = {
  to: string;
  displayName: string;
  poolName: string;
  poolSlug: string;
  picks: Record<string, string>; // { "tier-1": "Scottie Scheffler", ... }
};

export async function sendPickConfirmation({
  to,
  displayName,
  poolName,
  poolSlug,
  picks,
}: PickConfirmationInput) {
  const tierRows = Object.entries(picks)
    .sort(([a], [b]) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      return numA - numB;
    })
    .map(([tier, golfer]) => {
      const tierNum = tier.replace(/\D/g, "");
      return `<tr>
        <td style="padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;">Tier ${tierNum}</td>
        <td style="padding:8px 12px;font-size:14px;font-weight:500;color:#111827;border-bottom:1px solid #f3f4f6;">${golfer}</td>
      </tr>`;
    })
    .join("");

  const body = `
    ${h1("Your picks are in! ⛳")}
    ${p(`Hey ${displayName}, your picks for <strong>${poolName}</strong> have been saved. Good luck at Augusta!`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;margin-bottom:24px;border-collapse:collapse;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#1a4731;text-align:left;border-bottom:1px solid #e5e7eb;">Tier</th>
          <th style="padding:8px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#1a4731;text-align:left;border-bottom:1px solid #e5e7eb;">Golfer</th>
        </tr>
      </thead>
      <tbody>${tierRows}</tbody>
    </table>
    ${p("You can update your picks any time before the tournament starts on <strong>April 9 at 5:00 AM MT</strong>.")}
    ${btn("View or Edit Picks", `${APP_URL}/picks?pool=${poolSlug}`)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#9ca3af;">You received this because you submitted picks to ${poolName} on Masters Madness.</p>
  `;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `✅ Picks confirmed — ${poolName}`,
    html: layout(body),
  });
}

// ─── Pool Joined ───────────────────────────────────────────────────────────────

type PoolJoinedInput = {
  to: string;
  displayName: string;
  poolName: string;
  poolSlug: string;
  entryFee?: number | null;
  venmoLink?: string | null;
};

export async function sendPoolJoined({
  to,
  displayName,
  poolName,
  poolSlug,
  entryFee,
  venmoLink,
}: PoolJoinedInput) {
  const paymentNote =
    entryFee && venmoLink
      ? `<div style="background:#fefce8;border:1px solid #c9a84c40;border-radius:6px;padding:16px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#92400e;">Entry Fee: $${entryFee}</p>
          <p style="margin:0;font-size:13px;color:#78350f;">Pay your entry fee to lock in your spot:
            <a href="${venmoLink}" style="color:#1a4731;font-weight:600;">${venmoLink}</a>
          </p>
        </div>`
      : "";

  const body = `
    ${h1(`Welcome to ${poolName}! 🏆`)}
    ${p(`Hey ${displayName}, you've joined <strong>${poolName}</strong> on Masters Madness. Time to make your picks!`)}
    ${paymentNote}
    ${p("Picks lock on <strong>April 9, 2026 at 5:00 AM MT</strong> when the Masters begins. Make sure you get yours in before then.")}
    ${btn("Submit Your Picks", `${APP_URL}/picks?pool=${poolSlug}`)}
    ${divider()}
    ${p(`Share the pool with friends: <a href="${APP_URL}/pool/${poolSlug}" style="color:#1a4731;">${APP_URL}/pool/${poolSlug}</a>`)}
    <p style="margin:0;font-size:12px;color:#9ca3af;">You received this because you joined ${poolName} on Masters Madness.</p>
  `;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `You joined ${poolName} — Masters Madness`,
    html: layout(body),
  });
}

// ─── Commissioner Announcement ────────────────────────────────────────────────

type AnnouncementInput = {
  to: string[];
  poolName: string;
  poolSlug: string;
  subject: string;
  message: string;
  commissionerName: string;
};

export async function sendAnnouncement({
  to,
  poolName,
  poolSlug,
  subject,
  message,
  commissionerName,
}: AnnouncementInput) {
  if (to.length === 0) return;

  // Escape HTML entities in the message and convert newlines to <br>
  const safeMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");

  const body = `
    ${h1(subject)}
    ${p(`<em>From ${commissionerName}, commissioner of ${poolName}</em>`)}
    ${divider()}
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">${safeMessage}</p>
    ${btn("View Pool", `${APP_URL}/pool/${poolSlug}`)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#9ca3af;">You received this announcement as a member of ${poolName} on Masters Madness.</p>
  `;

  // Send one email per recipient (Resend has batch limit; BCC alternative would hide addresses)
  const results = await Promise.allSettled(
    to.map((email) =>
      getResend().emails.send({
        from: FROM,
        to: email,
        subject: `[${poolName}] ${subject}`,
        html: layout(body),
      })
    )
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return { sent: to.length - failed, failed };
}

// ─── Deadline Reminder ────────────────────────────────────────────────────────

type DeadlineReminderInput = {
  to: string;
  displayName: string;
  poolName: string;
  poolSlug: string;
};

export async function sendDeadlineReminder({
  to,
  displayName,
  poolName,
  poolSlug,
}: DeadlineReminderInput) {
  const body = `
    ${h1("⏰ Picks deadline is tomorrow!")}
    ${p(`Hey ${displayName}, just a reminder that picks for <strong>${poolName}</strong> lock tomorrow, <strong>April 9 at 5:00 AM MT</strong>.`)}
    ${p("The Masters begins Thursday morning. Make sure your picks are in before then!")}
    ${btn("Submit Picks Now", `${APP_URL}/picks?pool=${poolSlug}`)}
    ${divider()}
    <p style="margin:0;font-size:12px;color:#9ca3af;">You received this because you're a member of ${poolName} on Masters Madness. Picks lock April 9 at 5:00 AM MT.</p>
  `;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `⏰ Picks deadline tomorrow — ${poolName}`,
    html: layout(body),
  });
}
