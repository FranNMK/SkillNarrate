/*
 * src/app/(marketing)/portfolio/[slug]/page.tsx  →  URL: /portfolio/[slug]
 *
 * Public portfolio page — no login required
 * ──────────────────────────────────────────
 * This is the page a student shares with employers, on LinkedIn, or in
 * their CV. Anyone can view it — no Supabase session needed.
 *
 * HOW IT WORKS:
 *  1. We read the slug from the URL: /portfolio/jane-abc8f2e1
 *  2. We query portfolio_links for a row where slug = "jane-abc8f2e1"
 *     AND is_active = TRUE. If not found → 404.
 *  3. We get the user_id from that row.
 *  4. We fetch the user's profile (name, institution, course).
 *  5. We fetch all outputs where user_id matches AND is_published = TRUE.
 *     RLS allows this because the "outputs_select_public_portfolio" policy
 *     lets anyone read published outputs when the user has an active portfolio.
 *  6. We render everything in a clean, branded layout.
 *
 * WHY IS THIS IN (marketing)/portfolio/ AND NOT (dashboard)/?
 * The (marketing) route group uses the public Navbar + Footer layout.
 * Portfolio pages are PUBLIC — not behind a login wall. Putting them
 * in the marketing group gives them the correct shell.
 *
 * SEO:
 * We generate dynamic metadata (title, description, og:image placeholder)
 * so the page looks good when shared on LinkedIn or WhatsApp.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { OutputType } from "@/types/database";

// ── Output type display config ────────────────────────────────
const OUTPUT_CONFIG: Record<OutputType, { label: string; icon: string; color: string }> = {
  case_study:       { label: "Case Study",       icon: "📄", color: "#eff6ff" },
  linkedin_post:    { label: "LinkedIn Post",     icon: "💼", color: "#f0fdf4" },
  pitch_script:     { label: "Pitch Script",      icon: "🎤", color: "#fff7ed" },
  interview_answer: { label: "Interview Answer",  icon: "🎯", color: "#fdf4ff" },
};

// ── Dynamic metadata for SEO ──────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (supabase as any)
    .from("portfolio_links")
    .select("user_id, is_active")
    .eq("slug", slug)
    .single();

  if (!link?.is_active) {
    return { title: "Portfolio Not Found — SkillNarrate" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("full_name, course_field, institutions(name)")
    .eq("id", link.user_id)
    .single();

  const name = profile?.full_name ?? "A Student";
  const course = profile?.course_field ?? "";
  const institution = (profile?.institutions as { name: string } | null)?.name ?? "";

  return {
    title: `${name}'s Portfolio — SkillNarrate`,
    description: `${course ? `${course} student` : "Technical student"}${institution ? ` at ${institution}` : ""}. View their project case studies, LinkedIn posts, and more on SkillNarrate.`,
    openGraph: {
      title: `${name}'s Portfolio`,
      description: `Technical projects and case studies by ${name}.`,
      type: "profile",
    },
  };
}

// ──────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────────────────────
export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Step 1 — resolve the slug
  // We use the public (anon) client here — no session needed.
  // RLS policy "portfolio_links_select_by_slug" allows SELECT where is_active = TRUE.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: portfolioLink } = await (supabase as any)
    .from("portfolio_links")
    .select("user_id, slug, is_active")
    .eq("slug", slug)
    .single();

  // No link found, or portfolio is deactivated → show 404
  if (!portfolioLink || !portfolioLink.is_active) {
    notFound();
  }

  const userId = portfolioLink.user_id;

  // Step 2 — fetch the student's profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("full_name, course_field, graduation_year, institutions(name, county)")
    .eq("id", userId)
    .single();

  // Step 3 — fetch published outputs
  // RLS policy "outputs_select_public_portfolio" allows this read because:
  //   - is_published = TRUE (enforced by our .eq() filter)
  //   - This user has an active portfolio_link (we verified above)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: outputs } = await (supabase as any)
    .from("outputs")
    .select("id, output_type, content, project_id, projects(title)")
    .eq("user_id", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const name = profile?.full_name ?? "SkillNarrate Student";
  const firstName = name.split(" ")[0];
  const course = profile?.course_field ?? null;
  const institution = (profile?.institutions as { name: string; county: string } | null) ?? null;
  const graduationYear = profile?.graduation_year ?? null;
  const outputList = outputs ?? [];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="pt-16"> {/* offset for fixed navbar */}
      {/* ── Hero / Profile header ── */}
      <div
        style={{ backgroundColor: "var(--color-brand-primary)" }}
        className="py-16 px-6"
      >
        <div className="max-w-4xl mx-auto text-white">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-5 shadow-lg"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
            {name}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm opacity-85">
            {course && <span>{course}</span>}
            {course && institution && <span className="opacity-40">·</span>}
            {institution && (
              <span>
                {institution.name}
                {institution.county ? `, ${institution.county}` : ""}
              </span>
            )}
            {graduationYear && (
              <>
                <span className="opacity-40">·</span>
                <span>Class of {graduationYear}</span>
              </>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div>
              <span className="text-2xl font-black">{outputList.length}</span>
              <span className="text-sm opacity-70 ml-1.5">
                published {outputList.length === 1 ? "project" : "projects"}
              </span>
            </div>
          </div>

          {/* Powered by */}
          <p className="text-xs opacity-50 mt-4">
            Portfolio powered by SkillNarrate — Build it. Tell it. Own it.
          </p>
        </div>
      </div>

      {/* ── Content section ── */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {outputList.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📂</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              No published projects yet
            </h2>
            <p className="text-sm text-gray-400">
              {firstName} hasn&apos;t published any projects here yet. Check back soon.
            </p>
          </div>
        ) : (
          <div>
            <h2
              className="text-sm font-semibold uppercase tracking-widest mb-6"
              style={{ color: "var(--color-brand-primary)" }}
            >
              Projects
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {outputList.map((output: {
                id: string;
                output_type: OutputType;
                content: string;
                project_id: string;
                projects: { title: string } | null;
              }) => {
                const config = OUTPUT_CONFIG[output.output_type] ?? {
                  label: output.output_type,
                  icon: "📝",
                  color: "#f3f4f6",
                };
                // Show a preview: first 200 characters of the content
                const preview = output.content.slice(0, 200).trim();
                const hasMore = output.content.length > 200;

                return (
                  <Link
                    key={output.id}
                    href={`/portfolio/${slug}/output/${output.id}`}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    {/* Card header */}
                    <div
                      className="px-5 py-4 flex items-center gap-3"
                      style={{ backgroundColor: config.color }}
                    >
                      <span className="text-xl">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-600">
                          {config.label}
                        </p>
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {output.projects?.title ?? "Untitled Project"}
                        </p>
                      </div>
                      <span className="text-gray-400 text-sm group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </div>

                    {/* Content preview */}
                    <div className="px-5 py-4">
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                        {preview}{hasMore ? "…" : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CTA — invite visitors to sign up ── */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{ backgroundColor: "var(--color-brand-bg)", border: "1px solid #e5e7eb" }}
        >
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Are you a TVET or technical student?
          </p>
          <p className="text-sm text-gray-500 mb-5">
            Turn your projects into professional case studies, LinkedIn posts, and pitch scripts — for free.
          </p>
          <Link
            href="/signup"
            className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            Create your portfolio →
          </Link>
        </div>
      </div>
    </div>
  );
}
