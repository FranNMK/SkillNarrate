/*
 * src/app/(dashboard)/projects/[id]/settings/page.tsx  →  URL: /projects/[id]/settings
 *
 * Project settings page — edit project metadata (title) and add links/media.
 * The ProjectLinksEditor content lives here as its primary home.
 * The generate page also links here via the gear icon.
 *
 * SERVER COMPONENT — fetches project data; client form handles interaction.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectSettingsForm from "./ProjectSettingsForm";
import type { OutputType } from "@/types/database";

const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  case_study:       "Case Study",
  linkedin_post:    "LinkedIn Post",
  pitch_script:     "Pitch Script",
  interview_answer: "Interview Answer",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("projects")
    .select("title")
    .eq("id", id)
    .single();
  return {
    title: data?.title ? `Settings: ${data.title} — SkillNarrate` : "Project Settings — SkillNarrate",
  };
}

export default async function ProjectSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, error: projectError } = await (supabase as any)
    .from("projects")
    .select("id, title, output_type, logo_url, demo_video_url, demo_link, github_link")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) redirect("/dashboard");

  const outputLabel = OUTPUT_TYPE_LABELS[project.output_type as OutputType] ?? project.output_type;

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--color-brand-text)" }}>
          Project Settings
        </h1>
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">{project.title}</span>
          <span className="mx-1.5 text-gray-300">·</span>
          <span>{outputLabel}</span>
        </p>
      </div>

      {/* ── Banners ── */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}
      {saved === "true" && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          ✅ Project details saved.
        </div>
      )}

      <ProjectSettingsForm
        projectId={project.id}
        initial={{
          logo_url: project.logo_url ?? null,
          demo_video_url: project.demo_video_url ?? null,
          demo_link: project.demo_link ?? null,
          github_link: project.github_link ?? null,
        }}
      />
    </div>
  );
}
