"use client";
/*
 * src/components/features/OnboardingNudgeBanner.tsx
 *
 * A dismissible banner shown on the dashboard when a user's profile is
 * incomplete (onboarding was skipped or not yet completed).
 *
 * The banner is dismissed for the session via sessionStorage so it
 * doesn't flash on every page navigation. A persistent dismissal (per user)
 * can be added later via a profile flag if needed.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

interface OnboardingNudgeBannerProps {
  /** The first name to personalise the message. */
  firstName: string;
}

export default function OnboardingNudgeBanner({ firstName }: OnboardingNudgeBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show again if the user already dismissed it this session
    if (sessionStorage.getItem("sn_nudge_dismissed")) return;
    setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem("sn_nudge_dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3.5"
      style={{
        backgroundColor: "#fffbeb",
        borderColor: "#fde68a",
      }}
      role="alert"
    >
      {/* Icon */}
      <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">📋</span>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          Complete your profile, {firstName}
        </p>
        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
          Your profile is missing a few details. Adding your institution and course helps
          the AI tailor interview questions to your field — it only takes 2 minutes.
        </p>
        <Link
          href="/onboarding"
          className="inline-block mt-2 text-xs font-semibold underline-offset-2 hover:underline"
          style={{ color: "#92400e" }}
        >
          Complete profile →
        </Link>
      </div>

      {/* Dismiss × */}
      <button
        onClick={dismiss}
        className="shrink-0 text-amber-400 hover:text-amber-700 transition-colors text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
