/*
 * src/lib/actions/outputs.ts
 *
 * Server Actions for output management
 * ──────────────────────────────────────
 * publishOutputAction  — flips is_published = true (adds output to public portfolio)
 * unpublishOutputAction — flips is_published = false (removes from public portfolio)
 *
 * WHY SERVER ACTIONS here (not an API route)?
 * These actions are triggered by buttons in a form, making Server Actions
 * the cleanest pattern. No client-side fetch needed — just a form with an action.
 *
 * After publishing, we revalidate the portfolio path so Next.js refreshes
 * the cached public portfolio page with the new content.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ────────────────────────────────────────────────────────────
// PUBLISH OUTPUT
// Makes an output visible on the student's public portfolio.
// ────────────────────────────────────────────────────────────
export async function publishOutputAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const outputId = formData.get("output_id") as string;
  const projectId = formData.get("project_id") as string;

  if (!outputId) redirect("/dashboard");

  // Update is_published = true — user_id check prevents publishing other people's outputs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("outputs")
    .update({ is_published: true })
    .eq("id", outputId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/projects/${projectId}/generate?error=${encodeURIComponent(error.message)}`
    );
  }

  // Revalidate the generate page and any portfolio page
  revalidatePath(`/projects/${projectId}/generate`);
  revalidatePath("/portfolio", "layout"); // revalidates all /portfolio/* pages

  redirect(`/projects/${projectId}/generate?published=true`);
}

// ────────────────────────────────────────────────────────────
// UNPUBLISH OUTPUT
// Removes an output from the public portfolio.
// ────────────────────────────────────────────────────────────
export async function unpublishOutputAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const outputId = formData.get("output_id") as string;
  const projectId = formData.get("project_id") as string;

  if (!outputId) redirect("/dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("outputs")
    .update({ is_published: false })
    .eq("id", outputId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/projects/${projectId}/generate?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/projects/${projectId}/generate`);
  revalidatePath("/portfolio", "layout");

  redirect(`/projects/${projectId}/generate`);
}
