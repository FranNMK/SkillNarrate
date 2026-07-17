/*
 * src/lib/resend.ts
 *
 * Resend transactional email helper
 * ───────────────────────────────────
 * SERVER-ONLY — never import in a Client Component.
 *
 * Resend is a modern email API built for developers.
 * It gives you a simple SDK, great deliverability, and a generous free tier.
 *
 * We'll use it to send:
 *  - Email confirmation link after signup (Phase 1)
 *  - Password reset link (Phase 1)
 *  - Onboarding welcome email with tips (Phase 2)
 *  - "Your case study is ready" notification (Phase 4)
 *
 * IMPORTANT: You need to verify a sending domain in Resend Dashboard
 * before emails will actually deliver. For development you can use
 * Resend's test address: onboarding@resend.dev
 */

import { Resend } from "resend";

// Lazily create the Resend client so this file can be imported
// without throwing if the key isn't set yet (e.g. during type-checking).
let _resend: Resend | null = null;

export function getResendClient(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY environment variable is not set");
    _resend = new Resend(apiKey);
  }
  return _resend;
}

// ──────────────────────────────────────────────────────────
// Typed email sending wrapper
// ──────────────────────────────────────────────────────────
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string; // defaults to RESEND_FROM_EMAIL env var
}

export async function sendEmail(options: SendEmailOptions) {
  const resend = getResendClient();
  const from = options.from ?? process.env.RESEND_FROM_EMAIL ?? "noreply@skillnarrate.com";

  const { data, error } = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data;
}
