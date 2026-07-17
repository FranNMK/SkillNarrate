/*
 * src/app/api/email/send/route.ts
 *
 * POST /api/email/send
 *
 * Server-only route for sending transactional emails via Resend.
 * The Resend API key must NEVER be exposed to the browser.
 *
 * We'll use this for:
 *  - Account confirmation emails (Phase 1)
 *  - Password reset emails (Phase 1)
 *  - Onboarding welcome email after first project (Phase 2)
 *
 * Phase 0 stub — returns a mock success response.
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "to, subject, and html are required" },
        { status: 400 }
      );
    }

    // TODO (Phase 1): Replace with real Resend call using src/lib/resend.ts
    console.log(`[Phase 0 stub] Would send email to: ${to}, subject: ${subject}`);

    return NextResponse.json({
      id: "stub-email-id",
      note: "Real email sending arrives in Phase 1.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
