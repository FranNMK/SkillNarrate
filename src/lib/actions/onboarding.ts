/*
 * src/lib/actions/onboarding.ts
 *
 * Server Action: save onboarding profile data
 * ─────────────────────────────────────────────
 * This runs on the server when the user clicks "Finish" on the
 * last step of the onboarding wizard.
 *
 * What it does:
 *  1. Gets the current user's ID from the session (server-side, secure)
 *  2. Validates the required fields
 *  3. Upserts the profiles row with name, institution, course, year
 *  4. Sets onboarding_completed = TRUE
 *  5. Redirects to /dashboard
 *
 * WHY UPSERT instead of UPDATE?
 * "Upsert" = INSERT if the row doesn't exist, UPDATE if it does.
 * Our trigger creates the profiles row on signup, so the row WILL exist.
 * But using upsert is safer — it handles any edge case where the trigger
 * might have failed silently. Never assume the row exists.
 *
 * WHY DO WE SAVE ALL STEPS AT ONCE (not step-by-step)?
 * Saving incrementally creates partial profiles — if the user closes the
 * browser after step 1, you have a profile with a name but no institution.
 * Saving at the end means the profile is either complete or untouched.
 * The tradeoff is: if the user's connection drops on the last step, they
 * have to re-fill everything. For 3 fields, that's acceptable.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient();

  // Always verify who's calling this — never trust the client to send user_id
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Pull the values from the multi-step form
  const fullName = (formData.get("full_name") as string)?.trim();
  const institutionIdRaw = formData.get("institution_id") as string;
  const courseField = (formData.get("course_field") as string)?.trim();
  const graduationYearRaw = formData.get("graduation_year") as string;

  // Validate required fields
  if (!fullName) {
    redirect("/onboarding?error=Please+enter+your+full+name.&step=1");
  }
  if (!institutionIdRaw) {
    redirect("/onboarding?error=Please+select+your+institution.&step=2");
  }
  if (!courseField) {
    redirect("/onboarding?error=Please+enter+your+course+or+field+of+study.&step=3");
  }

  const institutionId = parseInt(institutionIdRaw, 10);
  const graduationYear = graduationYearRaw
    ? parseInt(graduationYearRaw, 10)
    : null;

  // Upsert the profile — update if exists, insert if not.
  // We cast to `any` here because our hand-written Database type uses
  // `Record<string, unknown>` for tables, which makes TypeScript unable
  // to infer the insert shape. In Phase 5 we'll replace this with the
  // auto-generated Supabase types, which resolve this cleanly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertError } = await (supabase as any)
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        institution_id: institutionId,
        course_field: courseField,
        graduation_year: graduationYear,
        onboarding_completed: true, // THE KEY FLAG — prevents wizard from showing again
      },
      { onConflict: "id" }
    );

  if (upsertError) {
    redirect(
      `/onboarding?error=${encodeURIComponent(upsertError.message)}&step=3`
    );
  }

  // Fire the welcome email (non-blocking — we don't await this)
  // We POST to our own API route so email sending doesn't slow down the redirect
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  fetch(`${appUrl}/api/email/welcome`, {
    method: "POST",
    // We pass the session cookies so the welcome route can verify the user
    headers: { "Content-Type": "application/json" },
  }).catch(() => {
    // Email failing shouldn't break onboarding — log silently
    console.warn("[onboarding] Welcome email failed to send");
  });

  // Revalidate all cached data so the dashboard sees the updated profile
  revalidatePath("/", "layout");
  // Pass ?onboarded=1 so the dashboard can show the post-onboarding welcome
  redirect("/dashboard?onboarded=1");
}
