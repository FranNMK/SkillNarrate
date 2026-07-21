/*
 * src/lib/actions/profile.ts
 *
 * Server Actions for profile management
 * ──────────────────────────────────────
 * updateProfileAction — updates name, course, institution, avatar_url
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const fullName       = (formData.get("full_name") as string)?.trim() || null;
  const courseField    = (formData.get("course_field") as string)?.trim() || null;
  const institutionIdRaw = (formData.get("institution_id") as string) || null;
  const graduationYearRaw = (formData.get("graduation_year") as string) || null;
  const avatarUrl      = (formData.get("avatar_url") as string)?.trim() || null;

  const institutionId = institutionIdRaw ? parseInt(institutionIdRaw, 10) : null;
  const graduationYear = graduationYearRaw ? parseInt(graduationYearRaw, 10) : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("profiles")
    .update({
      full_name: fullName,
      course_field: courseField,
      institution_id: institutionId,
      graduation_year: graduationYear,
      ...(avatarUrl !== null ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/settings/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/settings/profile?saved=true");
}

export async function updateProjectLinksAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const projectId    = (formData.get("project_id") as string)?.trim();
  const logoUrl      = (formData.get("logo_url") as string)?.trim() || null;
  const demoVideoUrl = (formData.get("demo_video_url") as string)?.trim() || null;
  const demoLink     = (formData.get("demo_link") as string)?.trim() || null;
  const githubLink   = (formData.get("github_link") as string)?.trim() || null;

  if (!projectId) redirect("/dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("projects")
    .update({ logo_url: logoUrl, demo_video_url: demoVideoUrl, demo_link: demoLink, github_link: githubLink })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/projects/${projectId}/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/projects/${projectId}/settings`);
  revalidatePath(`/projects/${projectId}/generate`);
  revalidatePath("/portfolio", "layout");
  redirect(`/projects/${projectId}/settings?saved=true`);
}
