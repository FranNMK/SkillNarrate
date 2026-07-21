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

// ── Template 1: Personalised welcome email ───────────────────
// Sent after the user COMPLETES onboarding (all profile fields saved).
// This is a warm, detailed welcome that explains the platform and
// what they can do now that their profile is set up.
export function welcomeEmailTemplate(params: {
  fullName: string;
  firstName?: string;
  courseField?: string;
  appUrl: string;
}): { subject: string; html: string } {
  const { fullName, appUrl, courseField } = params;
  const firstName = params.firstName || fullName.split(" ")[0] || fullName;
  const courseNote = courseField
    ? `<p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.6;">
        We've set up your profile for <strong>${courseField}</strong> — our AI will use this
        context to ask you the most relevant questions when you start your first project interview.
      </p>`
    : "";

  const body = `
    <h1 style="margin:0 0 6px;color:#0F766E;font-size:24px;font-weight:700;">
      Welcome to SkillNarrate, ${firstName}!
    </h1>
    <p style="margin:0 0 20px;color:#9CA3AF;font-size:13px;">Your profile is all set up. Here's what happens next.</p>

    <p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.6;">
      Hi ${firstName}, you've just joined a platform built specifically for TVET students
      like you — one that helps you turn the practical work you do every day into content
      that employers, clients, and institutions can actually see.
    </p>

    ${courseNote}

    <p style="margin:0 0 20px;color:#4B5563;font-size:15px;line-height:1.6;">
      Here's exactly what SkillNarrate lets you do:
    </p>

    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:20px;margin:0 0 24px;">
      <p style="margin:0 0 12px;font-weight:700;color:#166534;font-size:14px;">Your 4-step journey:</p>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;">
            <span style="background:#0F766E;color:#fff;font-size:11px;font-weight:700;border-radius:50%;display:inline-block;width:20px;height:20px;text-align:center;line-height:20px;">1</span>
          </td>
          <td style="padding:6px 0;color:#166534;font-size:14px;line-height:1.6;">
            <strong>Add a project</strong> — describe something you've built, repaired, designed, or coded. A sentence or two is enough to start.
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;">
            <span style="background:#0F766E;color:#fff;font-size:11px;font-weight:700;border-radius:50%;display:inline-block;width:20px;height:20px;text-align:center;line-height:20px;">2</span>
          </td>
          <td style="padding:6px 0;color:#166534;font-size:14px;line-height:1.6;">
            <strong>Do the AI interview</strong> — answer 5–8 guided questions about your project. Takes about 5 minutes. The AI adapts to your course.
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;">
            <span style="background:#0F766E;color:#fff;font-size:11px;font-weight:700;border-radius:50%;display:inline-block;width:20px;height:20px;text-align:center;line-height:20px;">3</span>
          </td>
          <td style="padding:6px 0;color:#166534;font-size:14px;line-height:1.6;">
            <strong>Generate your content</strong> — pick a format: a case study, LinkedIn post, pitch script, or interview answer. One click to generate.
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;">
            <span style="background:#0F766E;color:#fff;font-size:11px;font-weight:700;border-radius:50%;display:inline-block;width:20px;height:20px;text-align:center;line-height:20px;">4</span>
          </td>
          <td style="padding:6px 0;color:#166534;font-size:14px;line-height:1.6;">
            <strong>Share your portfolio</strong> — activate your public portfolio link and share it on LinkedIn, WhatsApp, or in job applications.
          </td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 20px;color:#4B5563;font-size:15px;line-height:1.6;">
      The students who get the most out of SkillNarrate start with just one project —
      something simple they already finished. You don't need a perfect project; you need
      a real one. Start there.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center">
          <a href="${appUrl}/dashboard"
             style="display:inline-block;background:#0F766E;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;letter-spacing:0.2px;">
            Go to your dashboard →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;color:#6B7280;font-size:13px;line-height:1.6;">
      If you have any questions, suggestions, or run into any issues — just reply to this email.
      We read and respond to every message personally.
    </p>
    <p style="margin:0;color:#6B7280;font-size:13px;">
      — The SkillNarrate team
    </p>
  `;

  return {
    subject: `You're all set, ${firstName} — your SkillNarrate profile is ready`,
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
