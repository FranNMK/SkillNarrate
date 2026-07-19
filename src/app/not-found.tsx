/*
 * src/app/not-found.tsx
 *
 * Global 404 page — shown for any URL that doesn't match a route.
 * This is the fallback for the entire app, not just a single segment.
 *
 * Next.js renders this automatically when:
 *   - A URL doesn't match any route
 *   - notFound() is called from a Server Component
 *     (route-specific not-found.tsx takes priority if it exists)
 */

import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";

export const metadata = {
  title: "Page Not Found — SkillNarrate",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="text-center max-w-sm">
          <p
            className="text-7xl font-black mb-4"
            style={{ color: "var(--color-brand-primary)", opacity: 0.15 }}
          >
            404
          </p>
          <h1
            className="text-2xl font-black mb-3 -mt-8"
            style={{ color: "var(--color-brand-text)" }}
          >
            Page not found
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist, or may have moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 text-center"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              Go home
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors text-center"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
