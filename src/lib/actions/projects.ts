/*
 * src/lib/actions/projects.ts
 *
 * Server Actions for project management
 * ──────────────────────────────────────
 * These actions handle:
 *  1. createProjectAction     — creates a new project row, redirects to interview
 *  2. completeInterviewAction — marks interview done, redirects to generate
 *
 * WHY SERVER ACTIONS for project creation (not just an API route)?
 * Because the form that creates a project lives in a Server Component page.
 * Server Actions let us handle the form POST on the server, run the DB
 * insert, and redirect — all without writing a separate fetch() in the client.
 *
 * SECURITY NOTE:
 * We always call supabase.auth.getUser() to get the user ID from the
 * verified session cookie. We NEVER trust a user_id sent from the form.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OutputType } from "@/types/database";

// Valid output types — we validate server-side so nobody POSTs junk
const VALID_OUTPUT_TYPES: OutputType[] = [
  "case_study",
  "linkedin_post",
  "pitch_script",
  "interview_answer",
];

// ────────────────────────────────────────────────────────────
// CREATE PROJECT
// ────────────────────────────────────────────────────────────
// What it does:
//  1. Verifies the user is logged in
//  2. Validates title (required), description (optional), output_type (required)
//  3. Inserts a new row into the projects table
//  4. Redirects to the interview page for that project
// ────────────────────────────────────────────────────────────
export async function createProjectAction(formData: FormData) {
  const supabase = await createClient();

  // Step 1 — who is this?
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Step 2 — pull and validate form fields
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const outputType = formData.get("output_type") as OutputType;

  if (!title) {
    redirect("/projects/new?error=Please+enter+a+project+title.");
  }

  if (!outputType || !VALID_OUTPUT_TYPES.includes(outputType)) {
    redirect("/projects/new?error=Please+select+an+output+type.");
  }

  // Step 3 — insert into projects table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, error: insertError } = await (supabase as any)
    .from("projects")
    .insert({
      user_id: user.id,
      title,
      description,
      output_type: outputType,
      raw_interview_answers: [],
      interview_completed: false,
    })
    .select("id")
    .single();

  if (insertError || !project) {
    redirect(
      `/projects/new?error=${encodeURIComponent(
        insertError?.message ?? "Failed to create project. Please try again."
      )}`
    );
  }

  // Step 4 — go to the interview page
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}/interview`);
}

// ────────────────────────────────────────────────────────────
// COMPLETE INTERVIEW
// ────────────────────────────────────────────────────────────
// Called when the student clicks "End Interview & Generate".
// Sets interview_completed = true and redirects to generate page.
// ────────────────────────────────────────────────────────────
export async function completeInterviewAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const projectId = formData.get("project_id") as string;

  if (!projectId) {
    redirect("/dashboard");
  }

  // Update the project — user_id filter ensures RLS + explicit ownership check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("projects")
    .update({ interview_completed: true })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (updateError) {
    redirect(
      `/projects/${projectId}/interview?error=${encodeURIComponent(updateError.message)}`
    );
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/generate`);
}
