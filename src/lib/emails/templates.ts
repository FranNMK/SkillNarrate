/*
 * src/lib/emails/templates.ts
 *
 * HTML email templates for SkillNarrate transactional emails
 * ─────────────────────────────────────────────────────────────
 * SERVER-ONLY. These are called from API routes, not the browser.
 *
 * WHY INLINE HTML STRINGS vs. a templating library?
 * For three simple emails, plain HTML strings are the simplest approach.
 * No extra dependencies. When we need more (Phase 5), we can switch to
 * react-email which lets you write email HTML as React components.
 *
 * IMPORTANT: Email clients are notoriously bad at rendering CSS.
 * These templates use inline styles and table-based layout for
 * maximum compatibility across Gmail, Outlook, Apple Mail, etc.
 *
 * Brand colours used:
 *   Teal    #0F766E  (primary)
 *   Amber   #F59E0B  (secondary)
 *   Charcoal #1F2937 (text)
 *   Off-white #F9FAFB (background)
 */

// ── Shared HTML shell ───────────────────────────────────────
function emailShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#0F766E;padding:28px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">SkillNarrate</p>
              <p style="margin:4px 0 0;color:#99F6E4;font-size:12px;">Build it. Tell it. Own it.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #E5E7EB;padding:20px 32px;background:#F9FAFB;">
              <p style="margin:0;color:#9CA3AF;font-size:11px;text-align:center;">
                SkillNarrate · Built for TVET students in Kenya and beyond<br/>
                You received this because you have an account at skillnarrate.com
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

// ── Template 1: Welcome / Onboarding email ───────────────────
// Sent after the FIRST successful login (Phase 2 trigger).
// This is not an auth email — it's a warm welcome with next steps.
export function welcomeEmailTemplate(params: {
  fullName: string;
  appUrl: string;
}): { subject: string; html: string } {
  const { fullName, appUrl } = params;
  const firstName = fullName.split(" ")[0] || fullName;

  const body = `
    <h1 style="margin:0 0 8px;color:#0F766E;font-size:24px;font-weight:700;">
      Welcome, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 20px;color:#4B5563;font-size:15px;line-height:1.6;">
      You're in. SkillNarrate is going to help you turn the projects you've already
      built into content that gets you noticed — case studies, LinkedIn posts,
      pitch scripts, and killer interview answers.
    </p>

    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 12px;font-weight:600;color:#166534;font-size:14px;">Here's how to get started:</p>
      <ol style="margin:0;padding-left:20px;color:#166534;font-size:14px;line-height:1.8;">
        <li>Complete your profile (tell us your institution and course)</li>
        <li>Add your first project — describe what you built</li>
        <li>Let the AI interview you about it (takes ~5 minutes)</li>
        <li>Pick your output format and generate your content</li>
      </ol>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${appUrl}/onboarding"
             style="display:inline-block;background:#0F766E;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;">
            Complete your profile →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;color:#9CA3AF;font-size:12px;text-align:center;">
      Questions? Reply to this email — we read every message.
    </p>
  `;

  return {
    subject: `Welcome to SkillNarrate, ${firstName}!`,
    html: emailShell("Welcome to SkillNarrate", body),
  };
}

// ── Template 2: Account confirmation (Supabase custom SMTP) ─
// NOTE: Supabase sends this automatically via custom SMTP.
// We don't call this from code — it's just here for reference /
// future migration to auth hooks.
export function confirmEmailTemplate(params: {
  confirmUrl: string;
}): { subject: string; html: string } {
  const body = `
    <h1 style="margin:0 0 8px;color:#0F766E;font-size:24px;font-weight:700;">
      Confirm your email address
    </h1>
    <p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">
      Click the button below to confirm your SkillNarrate account.
      This link expires in 24 hours.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${params.confirmUrl}"
             style="display:inline-block;background:#0F766E;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;">
            Confirm email address
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;color:#9CA3AF;font-size:12px;text-align:center;">
      If you didn't create a SkillNarrate account, you can safely ignore this email.
    </p>
  `;

  return {
    subject: "Confirm your SkillNarrate account",
    html: emailShell("Confirm your email", body),
  };
}

// ── Template 3: Password reset (Supabase custom SMTP) ───────
// Same as above — Supabase sends this automatically.
// Kept here for reference / future auth hooks migration.
export function resetPasswordEmailTemplate(params: {
  resetUrl: string;
}): { subject: string; html: string } {
  const body = `
    <h1 style="margin:0 0 8px;color:#0F766E;font-size:24px;font-weight:700;">
      Reset your password
    </h1>
    <p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">
      Click the button below to set a new password. This link expires in 1 hour.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${params.resetUrl}"
             style="display:inline-block;background:#0F766E;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;">
            Reset password
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;color:#9CA3AF;font-size:12px;text-align:center;">
      If you didn't request a password reset, you can safely ignore this email.
    </p>
  `;

  return {
    subject: "Reset your SkillNarrate password",
    html: emailShell("Reset your password", body),
  };
}
