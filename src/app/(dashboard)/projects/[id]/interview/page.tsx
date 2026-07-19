/*
 * src/app/(dashboard)/projects/[id]/interview/page.tsx  →  URL: /projects/[id]/interview
 *
 * The AI interview page
 * ──────────────────────
 * This is a SERVER COMPONENT. It:
 *  1. Reads the project from the database (verifying ownership via RLS)
 *  2. If the interview is already complete, redirects to /generate
 *  3. Passes the project data + existing Q&As to the InterviewChat client component
 *
 * WHY SPLIT BETWEEN SERVER AND CLIENT?
 * - The database read (fetching the project) must happen on the server — it's
 *   secure and fast (no client round-trip needed).
 * - The chat UI (text input, live updates, Gemini API calls) requires browser
 *   APIs (useState, fetch) so it must be a Client Component.
 *
 * The Server Component handles the "setup" and the Client Component handles
 * the "interaction" — a clean separation.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InterviewChat from "@/components/features/InterviewChat";
import type { OutputType, InterviewQA } from "@/types/database";

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
    title: data?.title ? `Interview: ${data.title} — SkillNarrate` : "Interview — SkillNarrate",
  };
}

export default async function InterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();

  // Step 1 — verify user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Step 2 — fetch the project (RLS ensures we only get rows owned by this user)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, error: projectError } = await (supabase as any)
    .from("projects")
    .select("id, title, description, output_type, raw_interview_answers, interview_completed")
    .eq("id", id)
    .eq("user_id", user.id)  // belt-and-suspenders ownership check
    .single();

  // If not found or doesn't belong to the user, redirect home
  if (projectError || !project) {
    redirect("/dashboard");
  }

  // Step 3 — if interview is complete, go to generate
  if (project.interview_completed) {
    redirect(`/projects/${id}/generate`);
  }

  // Step 4 — extract and type-assert the existing Q&As
  // raw_interview_answers is JSONB — Supabase returns it as a parsed JSON value.
  // We cast it to our typed InterviewQA[] shape.
  const initialHistory: InterviewQA[] = Array.isArray(project.raw_interview_answers)
    ? (project.raw_interview_answers as InterviewQA[])
    : [];

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-gray-800 transition-colors">
          My Projects
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">
          {project.title}
        </span>
        <span>/</span>
        <span className="text-gray-800 font-medium">Interview</span>
      </nav>

      {/* ── Error banner (e.g. from completeInterviewAction redirect) ── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* ── Help text for resumed interviews ── */}
      {initialHistory.length > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          Welcome back! You&apos;ve answered <strong>{initialHistory.length}</strong> question{initialHistory.length !== 1 ? "s" : ""} so far. Continue where you left off.
        </div>
      )}

      {/* ── The chat UI — client component takes over from here ── */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
        <InterviewChat
          projectId={project.id}
          projectTitle={project.title}
          outputType={project.output_type as OutputType}
          initialHistory={initialHistory}
        />
      </div>
    </div>
  );
}
