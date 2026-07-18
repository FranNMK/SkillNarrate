/*
 * src/app/page.tsx  — Landing Page  "/"
 *
 * This is a React Server Component (RSC) by default in Next.js App Router.
 * That means it runs on the server and its HTML is sent to the browser —
 * no extra client-side JavaScript needed for this page.
 *
 * For Phase 0 this is a static placeholder so we can verify the app boots.
 * Phase 1 will replace it with a real designed landing page.
 */

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      {/* ── Brand header ── */}
      <div className="text-center space-y-3">
        <h1
          className="text-5xl font-bold tracking-tight"
          style={{ color: "var(--color-brand-primary)" }}
        >
          SkillNarrate
        </h1>
        <p
          className="text-xl font-medium"
          style={{ color: "var(--color-brand-secondary)" }}
        >
          Build it. Tell it. Own it.
        </p>
        <p className="text-base max-w-md mx-auto" style={{ color: "#6B7280" }}>
          Turn your technical project into a polished case study, LinkedIn post,
          pitch script, or interview answer — guided by AI.
        </p>
      </div>

      {/* ── Phase badge ── */}
      <div
        className="px-4 py-2 rounded-full text-sm font-semibold"
        style={{
          backgroundColor: "#FEF3C7",
          color: "var(--color-brand-accent)",
          border: "1px solid var(--color-brand-secondary)",
        }}
      >
        ✨ Phase 2 — Auth live
      </div>

      {/* ── Placeholder CTA buttons ── */}
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/signup"
          className="px-6 py-3 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          Get started free
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg font-semibold border-2 transition-colors hover:bg-gray-50"
          style={{
            borderColor: "var(--color-brand-primary)",
            color: "var(--color-brand-primary)",
          }}
        >
          Sign in →
        </Link>
      </div>
    </main>
  );
}
