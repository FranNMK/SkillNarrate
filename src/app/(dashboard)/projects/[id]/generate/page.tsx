/*
 * src/app/(dashboard)/projects/[id]/generate/page.tsx  →  URL: /projects/[id]/generate
 *
 * Content generation page
 * ─────────────────────────
 * SERVER COMPONENT — reads the project + any existing output from the DB,
 * then renders the OutputGenerator client component with the fetched data.
 *
 * WHY PRE-LOAD EXISTING OUTPUT?
 * If the student generated content earlier and comes back to this page,
 * we want them to see their previous result immediately — not a blank state.
 * We fetch the existing output (if any) on the server and pass it as a prop
 * to the client component. This avoids a "flash of empty content" on load.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OutputGenerator from "@/components/features/OutputGenerator";
import type { OutputType, InterviewQA } from "@/types/database";

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
    title: data?.title ? `Generate: ${data.title} — SkillNarrate` : "Generate — SkillNarrate",
  };
}

export default async function GeneratePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; published?: string }>;
}) {
  const { id } = await params;
  const { error, published } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the project
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, error: projectError } = await (supabase as any)
    .from("projects")
    .select("id, title, output_type, raw_interview_answers, interview_completed")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) redirect("/dashboard");

  // If interview isn't done yet, send back
  if (!project.interview_completed) {
    redirect(`/projects/${id}/interview`);
  }

  // Fetch any existing output for this project+type (for pre-loading)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingOutput } = await (supabase as any)
    .from("outputs")
    .select("id, content, is_published")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .eq("output_type", project.output_type)
    .single();

  const history: InterviewQA[] = Array.isArray(project.raw_interview_answers)
    ? project.raw_interview_answers
    : [];

  const outputLabel = OUTPUT_TYPE_LABELS[project.output_type as OutputType] ?? project.output_type;

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-800 transition-colors">
          My Projects
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">
          {project.title}
        </span>
        <span>/</span>
        <span className="text-gray-800 font-medium">Generate</span>
      </nav>

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-brand-text)" }}>
          Your {outputLabel}
        </h1>
        <p className="text-sm text-gray-500">
          Based on your {history.length}-question interview about{" "}
          <span className="font-medium text-gray-700">{project.title}</span>.
        </p>
      </div>

      {/* ── Error / success banners ── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}
      {published === "true" && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          ✅ Added to your portfolio!{" "}
          <Link href="/settings/portfolio" className="underline hover:no-underline">
            View your portfolio link →
          </Link>
        </div>
      )}

      {/* ── OutputGenerator client component ── */}
      <OutputGenerator
        projectId={project.id}
        projectTitle={project.title}
        outputType={project.output_type as OutputType}
        existingOutput={
          existingOutput
            ? {
                id: existingOutput.id,
                content: existingOutput.content,
                isPublished: existingOutput.is_published,
              }
            : null
        }
      />

      {/* ── Interview summary (collapsible reference) ── */}
      <details className="mt-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
          <span>View your interview answers ({history.length})</span>
          <span className="text-gray-400 text-xs">click to expand</span>
        </summary>
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
          {history.map((qa, i) => (
            <div key={i} className="border-l-2 pl-4" style={{ borderColor: "var(--color-brand-primary)" }}>
              <p className="text-xs font-semibold text-gray-500 mb-1">Q{i + 1}: {qa.question}</p>
              <p className="text-sm text-gray-700">{qa.answer}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
