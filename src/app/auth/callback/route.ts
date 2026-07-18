/*
 * src/app/auth/callback/route.ts  →  URL: /auth/callback
 *
 * The OAuth + Email Confirmation callback handler
 * ─────────────────────────────────────────────────
 * WHY THIS ROUTE EXISTS:
 *
 * Both email confirmation links and Google OAuth redirects land HERE.
 * Here's the flow for each:
 *
 * EMAIL CONFIRMATION:
 *   User clicks confirm link in email
 *   → Supabase sends them to /auth/callback?token_hash=xxx&type=email
 *   → This route calls supabase.auth.verifyOtp()
 *   → Supabase confirms the email and sets the session cookies
 *   → We redirect to /onboarding (first time) or /dashboard (returning)
 *
 * GOOGLE OAUTH:
 *   Google redirects to /auth/callback?code=xxx
 *   → This route calls supabase.auth.exchangeCodeForSession()
 *   → Supabase exchanges the code for access+refresh tokens
 *   → Sets the session cookies
 *   → We check if this is a first-time user (profile.onboarding_completed)
 *   → Redirect to /onboarding or /dashboard accordingly
 *
 * IMPORTANT: This URL (/auth/callback) must be whitelisted in:
 *   1. Supabase Dashboard → Auth → URL Configuration → Redirect URLs
 *   2. Google Cloud Console → OAuth 2.0 → Authorized redirect URIs
 *      (exact value: https://[your-project-ref].supabase.co/auth/v1/callback)
 *
 * NEXT_PUBLIC_APP_URL must be set correctly in .env.local for dev,
 * and in Vercel environment variables for production.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Pick up all the possible query params Supabase can send
  const code = searchParams.get("code");           // OAuth flow
  const token_hash = searchParams.get("token_hash"); // Email confirm flow
  const type = searchParams.get("type");             // "email", "recovery", etc.

  // If something went wrong upstream, bail out gracefully
  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`);
  }

  const supabase = await createClient();

  // ── Path 1: Email confirmation / password reset (token_hash) ──
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"],
    });

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // ── Path 2: OAuth code exchange (Google) ──────────────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // ── Post-auth routing: where do we send them? ─────────────────
  // Check if this user has completed onboarding.
  // We read their profile from the database.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .returns<{ onboarding_completed: boolean }[]>()
      .single();

    // First-time user → onboarding wizard
    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  // Returning user → dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
