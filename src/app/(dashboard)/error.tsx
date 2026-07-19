"use client";
/*
 * src/app/(dashboard)/error.tsx
 *
 * WHY THIS FILE EXISTS:
 * An `error.tsx` must be a CLIENT COMPONENT (because it uses React error
 * boundaries, which are a client-side feature). It catches any unhandled
 * runtime errors thrown inside the (dashboard) route segment — including
 * errors from Server Components, Server Actions, or DB calls that throw.
 *
 * Without this, an unexpected error would show the raw Next.js error page.
 * With this, the user sees a friendly message and can retry.
 *
 * The `reset` function re-renders the segment, which often fixes transient
 * network or DB connection errors.
 */

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; in production you'd send this to a logging service
    console.error("[Dashboard error]", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto py-20 px-6 text-center">
      <div className="text-5xl mb-6">⚠️</div>
      <h2
        className="text-xl font-bold mb-3"
        style={{ color: "var(--color-brand-text)" }}
      >
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        An unexpected error occurred. Your data is safe — this is likely a
        temporary issue. Try refreshing or click below to retry.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
      {/* Show digest in dev for easier debugging */}
      {process.env.NODE_ENV === "development" && error.digest && (
        <p className="text-xs text-gray-300 mt-6 font-mono">
          digest: {error.digest}
        </p>
      )}
    </div>
  );
}
