"use client";
/*
 * src/components/features/WelcomePopup.tsx
 *
 * Shows a modal overlay on the first dashboard visit after login.
 * Flow:
 *  1. Mounts with a spinner for 1.2s (mimics "loading your workspace")
 *  2. Fades in the logo + welcome message + user's first name
 *  3. Auto-dismisses after 3s, or instantly on button click
 *
 * PERSISTENCE:
 * We use sessionStorage (not localStorage) so the popup shows once per browser
 * session — if the user refreshes or navigates away and comes back within the
 * same tab session they won't see it again, but a fresh login will show it.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Spinner from "@/components/ui/Spinner";

interface WelcomePopupProps {
  firstName: string;
}

export default function WelcomePopup({ firstName }: WelcomePopupProps) {
  const [visible, setVisible]     = useState(false);
  const [showMsg, setShowMsg]     = useState(false); // false = spinner phase, true = welcome phase

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("sn_welcomed")) return;
    sessionStorage.setItem("sn_welcomed", "1");

    setVisible(true);

    // After 1.2s switch from spinner → welcome message
    const t1 = setTimeout(() => setShowMsg(true), 1200);
    // Auto-dismiss after a further 2.5s
    const t2 = setTimeout(() => setVisible(false), 3700);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center sn-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={() => setVisible(false)}
    >
      {/* Card — stop click propagation so clicking the card doesn't close it */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl px-10 py-9 flex flex-col items-center text-center max-w-xs w-full mx-4 sn-fade-in"
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

        {showMsg ? (
          /* ── Welcome message phase ── */
          <div className="flex flex-col items-center sn-fade-in">
            <Image
              src="/images/logo.png"
              alt="SkillNarrate"
              width={64}
              height={64}
              className="rounded-2xl mb-4"
            />
            <p className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "var(--color-brand-secondary)" }}>
              Welcome to
            </p>
            <h2 className="text-xl font-black mb-1" style={{ color: "var(--color-brand-text)" }}>
              SkillNarrate
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Hello, <span className="font-semibold" style={{ color: "var(--color-brand-primary)" }}>{firstName}</span>! Ready to tell your story?
            </p>
            <button
              onClick={() => setVisible(false)}
              className="px-6 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              Let&apos;s go →
            </button>
          </div>
        ) : (
          /* ── Spinner phase ── */
          <div className="flex flex-col items-center py-4 sn-fade-in">
            <Spinner size={36} color="var(--color-brand-primary)" className="mb-4" />
            <p className="text-sm text-gray-500">Loading your workspace…</p>
          </div>
        )}
      </div>
    </div>
  );
}
