/*
 * src/app/(dashboard)/dashboard/page.tsx  →  URL: /dashboard
 *
 * Main dashboard — reads the user's profile and lists their projects.
 * This is a SERVER COMPONENT — reads session + DB without a client fetch.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OutputType } from "@/types/database";

export const metadata = { title: "Dashboard — SkillNarrate" };

// Human-readable labels for output types
const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  case_study: "Case Study",
  linkedin_post: "LinkedIn Post",
  pitch_script: "Pitch Script",
  interview_answer: "Interview Answer",
};

// Badge colours per output type
const OUTPUT_TYPE_COLORS: Record<OutputType, { bg: string; text: string }> = {
  case_study:       { bg: "#eff6ff", text: "#1d4ed8" },
  linkedin_post:    { bg: "#f0fdf4", text: "#15803d" },
  pitch_script:     { bg: "#fff7ed", text: "#c2410c" },
  interview_answer: { bg: "#fdf4ff", text: "#7e22ce" },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile with institution name (JOIN via foreign key)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, course_field, graduation_year, institutions(name)")
    .eq("id", user.id)
    .returns<{
      full_name: string | null;
      course_field: string | null;
      graduation_year: number | null;
      institutions: { name: string } | null;
    }[]>()
    .single();

  // Fetch the user's projects (most recent first)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: projects } = await (supabase as any)
    .from("projects")
    .select("id, title, output_type, interview_completed, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Count published outputs for the stats strip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: outputCount } = await (supabase as any)
    .from("outputs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Fetch portfolio link (if exists) to show the "Share" card
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: portfolioLink } = await (supabase as any)
    .from("portfolio_links")
    .select("slug, is_active")
    .eq("user_id", user.id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const firstName =
    profile?.full_name?.split(" ")[0] ||
    user.user_metadata?.full_name?.split(" ")[0] ||
    "there";

  const projectList = projects ?? [];

  return (
    <div>
      {/* ── Welcome header ── */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--color-brand-text)" }}
          >
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-500">
            {profile?.course_field && profile?.institutions
              ? `${profile.course_field} · ${(profile.institutions as { name: string }).name}`
              : "Ready to turn your projects into great content."}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 shrink-0"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          <span>+</span> New Project
        </Link>
      </div>

      {/* ── Quick stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Projects", value: String(projectList.length) },
          { label: "Interviews completed", value: String(projectList.filter((p: { interview_completed: boolean }) => p.interview_completed).length) },
          { label: "Outputs generated", value: String(outputCount ?? 0) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-gray-200 text-center"
          >
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-brand-primary)" }}
            >
              {value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Projects list ── */}
      {projectList.length === 0 ? (
        /* Empty state */
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-white">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ backgroundColor: "#F0FDF4" }}
          >
            📁
          </div>
          <h2 className="text-base font-semibold text-gray-700 mb-2">
            No projects yet
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Add your first project and let the AI interview you about it. Takes about 5 minutes.
          </p>
          <Link
            href="/projects/new"
            className="inline-block px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            + Add your first project
          </Link>
        </div>
      ) : (
        /* Projects grid */
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Your Projects
          </h2>
          <div className="grid gap-4">
            {projectList.map((project: {
              id: string;
              title: string;
              output_type: OutputType;
              interview_completed: boolean;
              created_at: string;
            }) => {
              const colors = OUTPUT_TYPE_COLORS[project.output_type] ?? { bg: "#f3f4f6", text: "#374151" };
              const label = OUTPUT_TYPE_LABELS[project.output_type] ?? project.output_type;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:border-gray-300 transition-colors"
                >
                  {/* Status icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: project.interview_completed ? "#f0fdf4" : "#fafafa" }}
                  >
                    {project.interview_completed ? "✅" : "🎙️"}
                  </div>

                  {/* Project info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {project.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {project.interview_completed
                        ? "Interview complete — ready to generate"
                        : "Interview in progress"}
                      {" · "}
                      {new Date(project.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Action link */}
                  <Link
                    href={
                      project.interview_completed
                        ? `/projects/${project.id}/generate`
                        : `/projects/${project.id}/interview`
                    }
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors shrink-0"
                    style={{
                      borderColor: "var(--color-brand-primary)",
                      color: "var(--color-brand-primary)",
                    }}
                  >
                    {project.interview_completed ? "View / Generate →" : "Continue →"}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
