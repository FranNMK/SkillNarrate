"use client";
/*
 * src/components/features/OnboardingWelcomeModal.tsx
 *
 * Modal shown exactly once right after a user completes onboarding.
 * The dashboard passes it when ?onboarded=1 is in the URL.
 *
 * On mount it removes the query param from the URL (via replaceState)
 * so a page refresh doesn't re-show it.
 */

import { useEffect, useState } from "react";
import Image from "next/image";

interface OnboardingWelcomeModalProps {
  firstName: string;
}

export default function OnboardingWelcomeModal({ firstName }: OnboardingWelcomeModalProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Clean ?onboarded=1 from the URL without a reload
    const url = new URL(window.location.href);
    url.searchParams.delete("onboarded");
    window.history.replaceState({}, "", url.toString());
  }, []);

  if (!visible) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center sn-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={() => setVisible(false)}
    >
      {/* Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl px-10 py-9 flex flex-col items-center text-center max-w-sm w-full mx-4 sn-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close × */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-4 text-gray-300 hover:text-gray-600 text-xl leading-none transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        <Image
          src="/images/logo.png"
          alt="SkillNarrate"
          width={64}
          height={64}
          className="rounded-2xl mb-4"
        />

        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: "var(--color-brand-secondary)" }}
        >
          Profile complete!
        </p>

        <h2
          className="text-2xl font-black mb-2"
          style={{ color: "var(--color-brand-text)" }}
        >
          Welcome, {firstName}! 🎉
        </h2>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Your profile is all set. Start by adding your first project and
          let the AI interview you about it.
        </p>

        <button
          onClick={() => setVisible(false)}
          className="px-7 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          Let&apos;s go →
        </button>
      </div>
    </div>
  );
}
