/*
 * src/app/(marketing)/portfolio/[slug]/not-found.tsx
 *
 * Custom 404 page for invalid or deactivated portfolio slugs.
 * next/navigation's notFound() function renders this file when
 * called from within the same route segment.
 */

import Link from "next/link";

export default function PortfolioNotFound() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">🔍</div>
        <h1
          className="text-2xl font-black mb-3"
          style={{ color: "var(--color-brand-text)" }}
        >
          Portfolio not found
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          This portfolio link doesn&apos;t exist or has been deactivated by its owner.
          Double-check the URL, or visit the homepage to learn more about SkillNarrate.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            Go to homepage
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Create your own →
          </Link>
        </div>
      </div>
    </div>
  );
}
