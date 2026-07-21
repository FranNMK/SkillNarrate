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
 *  3. UPDATEs the profiles row (trigger guarantees the row exists on signup)
 *  4. Sets onboarding_completed = TRUE
 *  5. Fires the welcome email BEFORE marking onboarding complete (race-condition fix)
 *  6. Redirects to /dashboard
 *
 * WHY UPDATE instead of UPSERT?
 * Our DB trigger (handle_new_user) inserts the profiles row on every signup,
 * so the row is guaranteed to exist. Using UPSERT triggers an INSERT attempt
 * first, which is blocked by RLS (no INSERT policy on profiles — intentional).
 * UPDATE is always allowed by RLS for the row owner.
 *
 * WHY DO WE SAVE ALL STEPS AT ONCE (not step-by-step)?
 * Saving incrementally creates partial profiles — if the user closes the
 * browser after step 1, you have a profile with a name but no institution.
 * Saving at the end means the profile is either complete or untouched.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/resend";
import { welcomeEmailTemplate } from "@/lib/emails/templates";

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

  // Use the admin/service-role client to bypass RLS for the UPDATE.
  // The anon client's UPDATE policy is fine (users can update their own row),
  // but using admin here is consistent with the welcome-email route and avoids
  // any edge-case where a fresh session cookie hasn't propagated yet.
  const adminClient = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // UPDATE (not upsert) — trigger guarantees the row exists.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (adminClient as any)
    .from("profiles")
    .update({
      full_name: fullName,
      institution_id: institutionId,
      course_field: courseField,
      graduation_year: graduationYear,
      onboarding_completed: true, // THE KEY FLAG — prevents wizard from showing again
    })
    .eq("id", user.id);

  if (updateError) {
    redirect(
      `/onboarding?error=${encodeURIComponent(updateError.message)}&step=3`
    );
  }

  // Send the personalised welcome email NOW (after saving but inline — not via
  // a separate fetch so we avoid the race condition where the email route checks
  // onboarding_completed and finds it already true before the email is sent).
  try {
    const firstName = fullName.split(" ")[0] || fullName;
    const { subject, html } = welcomeEmailTemplate({
      fullName,
      firstName,
      courseField,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://skillnarrate.com",
    });
    await sendEmail({ to: user.email!, subject, html });
  } catch {
    // Email failure must never block the redirect
    console.warn("[onboarding] Welcome email failed to send");
  }

  // Revalidate all cached data so the dashboard sees the updated profile
  revalidatePath("/", "layout");
  // Pass ?onboarded=1 so the dashboard can show the post-onboarding welcome modal
  redirect("/dashboard?onboarded=1");
}
