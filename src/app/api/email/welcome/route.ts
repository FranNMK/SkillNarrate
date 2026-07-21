/*
 * src/app/api/email/welcome/route.ts
 *
 * POST /api/email/welcome
 *
 * Sends the onboarding welcome email to a new user on their FIRST login.
 *
 * WHY A SEPARATE ROUTE (not done in the Server Action)?
 * The Server Action runs during the login redirect, which needs to be fast.
 * Email sending is a network call that could take 200-500ms. We fire this
 * as a background request from the client after the first dashboard load.
 *
 * In Phase 3+ we could use a Supabase Database Webhook instead — more robust.
 * For now this is clean and simple.
 *
 * REQUEST BODY: { userId: string }
 * The route fetches the user's name/email from the DB using the service role key
 * (which bypasses RLS — safe because this is a server-only route).
 */

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/resend";
import { welcomeEmailTemplate } from "@/lib/emails/templates";

export async function POST(request: Request) {
  try {
    // Verify the caller is authenticated — only logged-in users can trigger this
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the service role client to read the profile (bypasses RLS).
    // We need service role here because profiles RLS only allows users to
    // read their OWN row — and we want to read it server-side without
    // impersonating the user's session.
    const adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, course_field, onboarding_completed")
      .eq("id", user.id)
      .returns<{ full_name: string | null; course_field: string | null; onboarding_completed: boolean }[]>()
      .single();

    const fullName = profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "there";

    const { subject, html } = welcomeEmailTemplate({
      fullName,
      courseField: profile?.course_field ?? undefined,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://skillnarrate.com",
    });

    await sendEmail({
      to: user.email!,
      subject,
      html,
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[welcome email] Error:", err);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
