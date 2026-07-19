/*
 * src/app/(dashboard)/projects/new/page.tsx  →  URL: /projects/new
 *
 * Project creation form
 * ──────────────────────
 * This is a SERVER COMPONENT. The form submits to a Server Action
 * (createProjectAction) which runs on the server and redirects on success.
 *
 * WHAT THE STUDENT FILLS IN HERE:
 *  1. Project title  — e.g. "Smart Irrigation System"
 *  2. Short description (optional) — a few sentences about the project
 *  3. Output type — what they want to generate (case study / LinkedIn / etc.)
 *
 * After submission, they're taken straight to the AI interview for that project.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createProjectAction } from "@/lib/actions/projects";

export const metadata = { title: "New Project — SkillNarrate" };

// The four output types with human-readable labels and descriptions
const OUTPUT_TYPE_OPTIONS = [
  {
    value: "case_study",
    label: "Case Study",
    description: "A structured write-up of your project: problem, solution, tech stack, results. Great for job applications and portfolios.",
    icon: "📄",
  },
  {
    value: "linkedin_post",
    label: "LinkedIn Post",
    description: "An engaging post to share your project on LinkedIn. Highlights your skills and gets you noticed by employers.",
    icon: "💼",
  },
  {
    value: "pitch_script",
    label: "Pitch Script",
    description: "A 60-90 second verbal pitch. Perfect for hackathons, project demos, or when someone asks 'what are you building?'",
    icon: "🎤",
  },
  {
    value: "interview_answer",
    label: "Interview Answer",
    description: "A polished STAR-format answer for technical interviews. Shows your problem-solving process clearly.",
    icon: "🎯",
  },
] as const;

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();

  // Guard: must be logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Read any error message from the redirect query param
  const { error } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-800 transition-colors">
          My Projects
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">New Project</span>
      </nav>

      {/* ── Page header ── */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-brand-text)" }}
        >
          Tell me about your project
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Give it a name and choose what you want to create. The AI will then
          interview you about it — takes about 5 minutes.
        </p>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* ── Form ── */}
      <form action={createProjectAction} className="space-y-8">
        {/* Project title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Project title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. Smart Irrigation System, Budget Tracker App, School Management System"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition"
            style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            This is just a label for your own reference.
          </p>
        </div>

        {/* Optional description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Short description{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="A brief summary of what the project does. You can leave this blank — the AI interview will draw out the details."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition resize-none"
            style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
          />
        </div>

        {/* Output type selector */}
        <div>
          <fieldset>
            <legend className="block text-sm font-semibold text-gray-700 mb-3">
              What do you want to generate? <span className="text-red-500">*</span>
            </legend>
            <p className="text-xs text-gray-400 mb-4 -mt-1">
              The AI will tailor its questions to produce the best result for this format.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OUTPUT_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="relative flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white cursor-pointer transition-all hover:border-teal-300 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50"
                >
                  <input
                    type="radio"
                    name="output_type"
                    value={option.value}
                    required
                    className="sr-only"
                  />
                  <span className="text-xl shrink-0 mt-0.5">{option.icon}</span>
                  <div>
                    <span className="block text-sm font-semibold text-gray-800">
                      {option.label}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {option.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            Start Interview →
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
