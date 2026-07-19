/*
 * src/app/(dashboard)/settings/portfolio/page.tsx  →  URL: /settings/portfolio
 *
 * Portfolio settings page
 * ─────────────────────────
 * SERVER COMPONENT. Shows the student their portfolio URL, lets them:
 *   - Create/activate their portfolio (generates a slug)
 *   - Copy the public URL to share
 *   - Toggle the portfolio visible/hidden
 *   - Regenerate the slug (changes the URL)
 *   - See which outputs are published and navigate to them
 *
 * WHY IS THIS A SERVER COMPONENT?
 * All the data (portfolio link, published outputs) is fetched from the DB.
 * The toggle/regenerate buttons use Server Actions so no client-side
 * state or fetch() is needed. The copy button (clipboard API) is the
 * only browser-specific action — we handle it with a tiny inline script.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createOrActivatePortfolioAction,
  togglePortfolioActiveAction,
  regenerateSlugAction,
} from "@/lib/actions/portfolio";
import type { OutputType } from "@/types/database";

export const metadata = { title: "Portfolio Settings — SkillNarrate" };

const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  case_study:       "Case Study",
  linkedin_post:    "LinkedIn Post",
  pitch_script:     "Pitch Script",
  interview_answer: "Interview Answer",
};

export default async function PortfolioSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; activated?: string; regenerated?: string }>;
}) {
  const { error, activated, regenerated } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the user's portfolio_links row (may not exist yet)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: portfolioLink } = await (supabase as any)
    .from("portfolio_links")
    .select("id, slug, is_active")
    .eq("user_id", user.id)
    .single();

  // Fetch published outputs so the student can see what's in their portfolio
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: publishedOutputs } = await (supabase as any)
    .from("outputs")
    .select("id, output_type, project_id, projects(title)")
    .eq("user_id", user.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Count all outputs (published + drafts) for context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: totalOutputs } = await (supabase as any)
    .from("outputs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portfolioUrl = portfolioLink
    ? `${appUrl}/portfolio/${portfolioLink.slug}`
    : null;

  const outputs = publishedOutputs ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Portfolio Settings</span>
      </nav>

      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-brand-text)" }}>
          Your Public Portfolio
        </h1>
        <p className="text-sm text-gray-500">
          Share a single link that shows all your published work — no login needed for visitors.
        </p>
      </div>

      {/* ── Banners ── */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}
      {activated === "true" && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          ✅ Portfolio activated! Your public page is now live.
        </div>
      )}
      {regenerated === "true" && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          🔄 Your portfolio URL has been regenerated. The old link no longer works.
        </div>
      )}

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          {!portfolioLink ? (
            /* ── No portfolio yet ── */
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🌐</div>
              <h2 className="font-semibold text-gray-800 mb-2">
                You don&apos;t have a portfolio link yet
              </h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                Activate your portfolio to get a shareable link. Visitors can view your
                published outputs without logging in.
              </p>
              <form action={createOrActivatePortfolioAction}>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-brand-primary)" }}
                >
                  🌐 Activate My Portfolio
                </button>
              </form>
              {(totalOutputs ?? 0) === 0 && (
                <p className="text-xs text-gray-400 mt-4">
                  Tip: Generate and publish some outputs first so your portfolio isn&apos;t empty.{" "}
                  <Link href="/projects/new" className="underline hover:no-underline">
                    Start a project →
                  </Link>
                </p>
              )}
            </div>
          ) : (
            /* ── Portfolio exists ── */
            <div>
              {/* Status badge */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={
                    portfolioLink.is_active
                      ? { backgroundColor: "#f0fdf4", color: "#15803d" }
                      : { backgroundColor: "#fef2f2", color: "#b91c1c" }
                  }
                >
                  {portfolioLink.is_active ? "● Live" : "● Hidden"}
                </span>
                <span className="text-xs text-gray-400">
                  {portfolioLink.is_active
                    ? "Visible to anyone with the link"
                    : "Not visible to the public (visitors see a 404)"}
                </span>
              </div>

              {/* URL display */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-xs text-gray-500 font-medium mb-2">Your portfolio URL</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                    {portfolioUrl}
                  </code>
                  {/* Copy button — uses a small inline script so no Client Component needed */}
                  <button
                    onClick={undefined}
                    id="copy-btn"
                    data-url={portfolioUrl}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-white transition-colors"
                    // We use a data attribute + inline onclick so this works without
                    // a full client component. The script tag below handles the click.
                  >
                    Copy
                  </button>
                  <Link
                    href={`/portfolio/${portfolioLink.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-white transition-colors"
                  >
                    Open ↗
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {/* Toggle active / inactive */}
                <form action={togglePortfolioActiveAction}>
                  <input type="hidden" name="current_active" value={String(portfolioLink.is_active)} />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
                    style={
                      portfolioLink.is_active
                        ? { borderColor: "#ef4444", color: "#ef4444" }
                        : { borderColor: "var(--color-brand-primary)", color: "var(--color-brand-primary)" }
                    }
                  >
                    {portfolioLink.is_active ? "Hide Portfolio" : "Make Public Again"}
                  </button>
                </form>

                {/* Regenerate slug */}
                <form action={regenerateSlugAction}>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      if (!confirm("This will change your portfolio URL. Your old link will stop working. Continue?")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    🔄 Regenerate URL
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Published outputs list ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Published Outputs ({outputs.length})
          </h2>
          {outputs.length < (totalOutputs ?? 0) && (
            <span className="text-xs text-gray-400">
              {(totalOutputs ?? 0) - outputs.length} draft{(totalOutputs ?? 0) - outputs.length !== 1 ? "s" : ""} not published
            </span>
          )}
        </div>

        {outputs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400 mb-3">
              No published outputs yet.
            </p>
            <p className="text-xs text-gray-400">
              Go to a project&apos;s Generate page and click{" "}
              <strong>&quot;Add to Portfolio&quot;</strong> to publish outputs here.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-xs font-semibold underline hover:no-underline"
              style={{ color: "var(--color-brand-primary)" }}
            >
              View my projects →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {outputs.map((output: {
              id: string;
              output_type: OutputType;
              project_id: string;
              projects: { title: string } | null;
            }) => (
              <div
                key={output.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {output.projects?.title ?? "Untitled Project"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {OUTPUT_TYPE_LABELS[output.output_type] ?? output.output_type}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {portfolioLink && (
                    <Link
                      href={`/portfolio/${portfolioLink.slug}/output/${output.id}`}
                      target="_blank"
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      View public ↗
                    </Link>
                  )}
                  <Link
                    href={`/projects/${output.project_id}/generate`}
                    className="text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium"
                    style={{ borderColor: "var(--color-brand-primary)", color: "var(--color-brand-primary)" }}
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tiny inline script for copy-to-clipboard ── */}
      {/* This avoids making the whole page a Client Component just for one button */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('copy-btn')?.addEventListener('click', function() {
              const url = this.dataset.url;
              if (url) {
                navigator.clipboard.writeText(url).then(() => {
                  this.textContent = 'Copied!';
                  setTimeout(() => { this.textContent = 'Copy'; }, 2000);
                }).catch(() => {
                  // fallback
                  const ta = document.createElement('textarea');
                  ta.value = url;
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                  this.textContent = 'Copied!';
                  setTimeout(() => { this.textContent = 'Copy'; }, 2000);
                });
              }
            });
          `,
        }}
      />
    </div>
  );
}
