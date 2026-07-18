/*
 * src/app/onboarding/page.tsx  →  URL: /onboarding
 *
 * Onboarding wizard — shown once after first login, never again.
 *
 * ── ARCHITECTURE: Server + Client split ──────────────────────
 *
 * This file is a SERVER COMPONENT (no "use client" at the top).
 * Server Components run on the server, can be async, and can read
 * from the database directly — before any HTML is sent to the browser.
 *
 * This page does TWO things on the server before rendering:
 *
 *  1. GUARD CHECK: Read profiles.onboarding_completed from the DB.
 *     If it's true, redirect to /dashboard immediately.
 *     The user never sees the wizard — not even a flash of it.
 *     This is the "never show again" lock.
 *
 *  2. DATA FETCH: Load all 180 institutions from the DB.
 *     Pass them as a prop to the client wizard.
 *     This means the dropdown is populated on first render — no
 *     loading spinner, no client-side fetch needed.
 *
 * Then it renders <OnboardingWizard>, a Client Component that
 * manages which step is showing using useState.
 *
 * ── WHY NOT PUT THE GUARD IN MIDDLEWARE? ─────────────────────
 * The middleware already redirects logged-OUT users away from /onboarding.
 * But it doesn't check onboarding_completed — doing a DB query in middleware
 * would make EVERY request slower (middleware runs on every page).
 * The server component guard is the right place for this specific check.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./OnboardingWizard";
import type { Institution } from "@/types/database";

export const metadata = { title: "Welcome — Set up your profile" };

export default async function OnboardingPage() {
  const supabase = await createClient();

  // ── Guard: check if user is logged in ───────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ── Guard: check if already onboarded ───────────────────────
  // This is the "never show again" check.
  // If onboarding_completed is true, bounce them to dashboard.
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, full_name")
    .eq("id", user.id)
    .returns<{ onboarding_completed: boolean; full_name: string | null }[]>()
    .single();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  // ── Data fetch: load all institutions for the dropdown ───────
  // We fetch here (server-side) so the client wizard gets the list
  // as a prop — no client-side loading state needed.
  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, name, nearest_town, county, category")
    .order("name", { ascending: true })
    .returns<Institution[]>();

  // Pre-fill the name from Google OAuth metadata if available
  const prefillName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-brand-bg)" }}
    >
      {/* ── Brand header ── */}
      <div className="mb-8 text-center">
        <p
          className="text-2xl font-bold"
          style={{ color: "var(--color-brand-primary)" }}
        >
          SkillNarrate
        </p>
        <p className="text-sm text-gray-500 mt-1">Build it. Tell it. Own it.</p>
      </div>

      {/* ── Wizard (Client Component) ── */}
      <OnboardingWizard
        institutions={institutions ?? []}
        prefillName={prefillName}
      />
    </div>
  );
}
