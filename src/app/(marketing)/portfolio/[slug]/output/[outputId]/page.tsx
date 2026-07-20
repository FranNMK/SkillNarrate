/*
 * src/app/(marketing)/portfolio/[slug]/output/[outputId]/page.tsx
 * URL: /portfolio/[slug]/output/[outputId]
 *
 * Individual output share page — no login required
 * ──────────────────────────────────────────────────
 * Shows a single generated output (case study, LinkedIn post, etc.)
 * in a clean full-page layout. This is the link a student would send
 * to a recruiter or paste in their CV.
 *
 * SECURITY:
 * We verify the output belongs to the user who owns the slug, AND
 * that is_published = TRUE. This prevents guessing output IDs to see
 * unpublished drafts.
 *
 * The RLS policy "outputs_select_public_portfolio" on the database
 * also enforces this — so there's defence in depth (app layer + DB layer).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { OutputType } from "@/types/database";
import PublicOutputActions from "@/components/features/PublicOutputActions";

const OUTPUT_CONFIG: Record<OutputType, { label: string; icon: string }> = {
  case_study:       { label: "Case Study",       icon: "📄" },
  linkedin_post:    { label: "LinkedIn Post",     icon: "💼" },
  pitch_script:     { label: "Pitch Script",      icon: "🎤" },
  interview_answer: { label: "Interview Answer",  icon: "🎯" },
};

// ── Dynamic SEO metadata ───────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; outputId: string }>;
}): Promise<Metadata> {
  const { slug, outputId } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (supabase as any)
    .from("portfolio_links")
    .select("user_id")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!link) return { title: "Output Not Found — SkillNarrate" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: output } = await (supabase as any)
    .from("outputs")
    .select("output_type, projects(title)")
    .eq("id", outputId)
    .eq("user_id", link.user_id)
    .eq("is_published", true)
    .single();

  if (!output) return { title: "Output Not Found — SkillNarrate" };

  const projectTitle = (output.projects as { title: string } | null)?.title ?? "Untitled Project";
  const config = OUTPUT_CONFIG[output.output_type as OutputType];

  return {
    title: `${projectTitle} — ${config?.label ?? "Output"} | SkillNarrate`,
    description: `Read the ${config?.label ?? "project output"} for "${projectTitle}" on SkillNarrate.`,
    openGraph: {
      title: `${projectTitle} — ${config?.label ?? "Output"}`,
      description: `Read the ${config?.label ?? "output"} generated from an AI-guided project interview.`,
      type: "article",
    },
  };
}

// ── Formatted content renderer ──────────────────────────────
// Converts Gemini markdown output (## headings, **bold**) to JSX.
function FormattedContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-3 text-base leading-relaxed text-gray-800">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="text-lg font-bold mt-8 mb-2 pt-6 border-t border-gray-100 first:border-t-0 first:pt-0 first:mt-0"
              style={{ color: "var(--color-brand-text)" }}>
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("[") && line.endsWith("]")) {
          // Pitch script section labels like [HOOK], [PROBLEM]
          return (
            <p key={i} className="text-xs font-black uppercase tracking-widest mt-6 mb-1"
              style={{ color: "var(--color-brand-primary)" }}>
              {line.slice(1, -1)}
            </p>
          );
        }
        if (line.startsWith("**") && line.endsWith("**") && !line.slice(2, -2).includes("**")) {
          return (
            <p key={i} className="font-bold text-gray-900">{line.slice(2, -2)}</p>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────────────────────
export default async function PublicOutputPage({
  params,
}: {
  params: Promise<{ slug: string; outputId: string }>;
}) {
  const { slug, outputId } = await params;
  const supabase = await createClient();

  // Step 1 — resolve the slug → user_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: portfolioLink } = await (supabase as any)
    .from("portfolio_links")
    .select("user_id, slug, is_active")
    .eq("slug", slug)
    .single();

  if (!portfolioLink || !portfolioLink.is_active) notFound();

  const userId = portfolioLink.user_id;

  // Step 2 — fetch the specific output (with project media fields)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: output } = await (supabase as any)
    .from("outputs")
    .select("id, output_type, content, project_id, projects(title, logo_url, demo_link, demo_video_url, github_link)")
    .eq("id", outputId)
    .eq("user_id", userId)
    .eq("is_published", true)
    .single();

  if (!output) notFound();

  // Step 3 — fetch the student's profile (with avatar and institution)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("full_name, course_field, avatar_url, institutions(name)")
    .eq("id", userId)
    .single();

  const config = OUTPUT_CONFIG[output.output_type as OutputType] ?? { label: "Output", icon: "📝" };
  const proj = output.projects as {
    title: string;
    logo_url: string | null;
    demo_link: string | null;
    demo_video_url: string | null;
    github_link: string | null;
  } | null;
  const projectTitle = proj?.title ?? "Untitled Project";
  const authorName  = profile?.full_name ?? "SkillNarrate Student";
  const avatarUrl: string | null = profile?.avatar_url ?? null;
  const institutionName = (profile?.institutions as { name: string } | null)?.name ?? null;
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const shareUrl  = `${appUrl}/portfolio/${slug}/output/${outputId}`;

  return (
    <div className="pt-16"> {/* offset for fixed navbar */}
      {/* ── Article header ── */}
      <div
        style={{ backgroundColor: "var(--color-brand-primary)" }}
        className="py-12 px-6"
      >
        <div className="max-w-3xl mx-auto text-white">
          {/* Breadcrumb */}
          <Link
            href={`/portfolio/${slug}`}
            className="inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100 transition-opacity mb-5"
          >
            ← Back to {authorName.split(" ")[0]}&apos;s Portfolio
          </Link>

          {/* Type badge + project logo */}
          <div className="flex items-center gap-3 mb-3">
            {proj?.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={proj.logo_url}
                alt=""
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover border-2"
                style={{ borderColor: "rgba(255,255,255,0.3)" }}
              />
            ) : (
              <span className="text-xl">{config.icon}</span>
            )}
            <span className="text-sm font-semibold opacity-80">{config.label}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">
            {projectTitle}
          </h1>

          {/* Project links strip */}
          {(proj?.github_link || proj?.demo_link || proj?.demo_video_url) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {proj?.github_link && (
                <a href={proj.github_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.28-.01-1.03-.01-2.02-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013-.4c1.02 0 2.04.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/></svg>
                  GitHub
                </a>
              )}
              {proj?.demo_link && (
                <a href={proj.demo_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  🔗 Live Demo
                </a>
              )}
              {proj?.demo_video_url && (
                <a href={proj.demo_video_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  ▶ Demo Video
                </a>
              )}
            </div>
          )}

          {/* Author strip */}
          <div className="flex items-center gap-3 mt-4">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={authorName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2"
                style={{ borderColor: "rgba(255,255,255,0.3)" }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-sm">
              <p className="font-semibold">{authorName}</p>
              <p className="opacity-70 text-xs">
                {profile?.course_field && <span>{profile.course_field}</span>}
                {profile?.course_field && institutionName && <span className="mx-1 opacity-50">·</span>}
                {institutionName && <span>{institutionName}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <FormattedContent text={output.content} />
        </div>

        {/* ── Share / action bar ── */}
        <PublicOutputActions
          shareUrl={shareUrl}
          content={output.content}
          outputType={output.output_type}
          title={`${projectTitle} — ${config.label}`}
        />

        {/* Back to portfolio */}
        <div className="mt-3">
          <Link
            href={`/portfolio/${slug}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← More projects
          </Link>
        </div>

        {/* ── Attribution + CTA ── */}
        <div
          className="mt-12 rounded-2xl p-7 text-center"
          style={{ backgroundColor: "var(--color-brand-bg)", border: "1px solid #e5e7eb" }}
        >
          <p className="text-xs text-gray-400 mb-3">
            This {config.label.toLowerCase()} was generated using
          </p>
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              SN
            </span>
            <span className="font-bold text-sm" style={{ color: "var(--color-brand-text)" }}>
              SkillNarrate
            </span>
          </Link>
          <p className="text-sm text-gray-500 mb-4">
            AI-guided interviews that turn your technical projects into<br />
            professional case studies, LinkedIn posts, and more.
          </p>
          <Link
            href="/signup"
            className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            Create yours free →
          </Link>
        </div>
      </div>

    </div>
  );
}
