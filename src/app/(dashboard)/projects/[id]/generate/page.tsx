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
import PrivateOutputCard from "@/components/features/PrivateOutputCard";
import ProjectLinksEditor from "@/components/features/ProjectLinksEditor";
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
  searchParams: Promise<{ error?: string; published?: string; linksSaved?: string }>;
}) {
  const { id } = await params;
  const { error, published, linksSaved } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the project
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, error: projectError } = await (supabase as any)
    .from("projects")
    .select("id, title, output_type, raw_interview_answers, interview_completed, logo_url, demo_video_url, demo_link, github_link")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) redirect("/dashboard");

  // If interview isn't done yet, send back
  if (!project.interview_completed) {
    redirect(`/projects/${id}/interview`);
  }

  // Fetch ALL existing outputs for this project (primary + any private extras already generated)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allOutputs } = await (supabase as any)
    .from("outputs")
    .select("id, content, output_type, is_published")
    .eq("project_id", id)
    .eq("user_id", user.id);

  const outputsMap: Record<string, { id: string; content: string; isPublished: boolean }> = {};
  for (const o of allOutputs ?? []) {
    outputsMap[o.output_type] = { id: o.id, content: o.content, isPublished: o.is_published };
  }

  const primaryOutputType = project.output_type as OutputType;
  const existingOutput = outputsMap[primaryOutputType] ?? null;

  // The three private extra types are every output type that isn't the primary one
  const ALL_OUTPUT_TYPES: OutputType[] = ["case_study", "linkedin_post", "pitch_script", "interview_answer"];
  const privateOutputTypes = ALL_OUTPUT_TYPES.filter((t) => t !== primaryOutputType);

  const history: InterviewQA[] = Array.isArray(project.raw_interview_answers)
    ? project.raw_interview_answers
    : [];

  const outputLabel = OUTPUT_TYPE_LABELS[primaryOutputType] ?? project.output_type;

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
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-brand-text)" }}>
            Your {outputLabel}
          </h1>
          <p className="text-sm text-gray-500">
            Based on your {history.length}-question interview about{" "}
            <span className="font-medium text-gray-700">{project.title}</span>.
          </p>
        </div>
        {/* Continue Interview — allows adding more Q&As to improve outputs */}
        <Link
          href={`/projects/${project.id}/interview?continue=1`}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
          style={{ borderColor: "var(--color-brand-primary)", color: "var(--color-brand-primary)" }}
        >
          🎙 Continue Interview
        </Link>
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
      {linksSaved === "true" && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          ✅ Project details saved.
        </div>
      )}

      {/* ── Primary output (publishable) ── */}
      <OutputGenerator
        projectId={project.id}
        projectTitle={project.title}
        outputType={primaryOutputType}
        existingOutput={existingOutput}
      />

      {/* ── Private extra outputs ── */}
      <div className="mt-10">
        <div className="mb-4">
          <h2 className="text-base font-bold" style={{ color: "var(--color-brand-text)" }}>
            More outputs from this interview
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Generate additional formats using the same interview answers. These are private — they won&apos;t appear on your public portfolio.
          </p>
        </div>
        <div className="space-y-3">
          {privateOutputTypes.map((type) => (
            <PrivateOutputCard
              key={type}
              projectId={project.id}
              outputType={type}
              existingContent={outputsMap[type]?.content ?? null}
            />
          ))}
        </div>
      </div>

      {/* ── Project links / media editor ── */}
      <ProjectLinksEditor
        projectId={project.id}
        initial={{
          logo_url: project.logo_url ?? null,
          demo_video_url: project.demo_video_url ?? null,
          demo_link: project.demo_link ?? null,
          github_link: project.github_link ?? null,
        }}
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
