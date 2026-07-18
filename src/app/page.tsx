/*
 * src/app/page.tsx  →  URL: "/"
 *
 * Homepage — Server Component (static, no DB reads needed here).
 *
 * WHY NAVBAR/FOOTER INLINE (not in a layout)?
 * The /about and /support pages live inside src/app/(marketing)/
 * and inherit the marketing layout with Navbar+Footer.
 * The root page.tsx cannot live in that group without a route conflict,
 * so we import Navbar+Footer directly here instead.
 *
 * Sections:
 *   1. Navbar
 *   2. Hero
 *   3. Social proof / stat strip
 *   4. How It Works (4 steps)
 *   5. Output format previews (2×2 grid)
 *   6. Full-width CTA band
 *   7. Footer
 */

import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      {/* ───────────────────────────────────────────────────────
          HERO
          Left: headline + tagline + CTAs
          Right: mock output card (shows the product works)
      ─────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ── */}
          <div>
            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
              style={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                border: "1px solid #FDE68A",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#F59E0B" }}
              />
              Built for TVET &amp; Technical Students in Kenya
            </div>

            <h1
              className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-5"
              style={{ color: "var(--color-brand-text)" }}
            >
              Your project deserves{" "}
              <span style={{ color: "var(--color-brand-primary)" }}>
                a great story.
              </span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              You built something real. SkillNarrate turns your technical project
              into a polished{" "}
              <strong className="text-gray-700">case study</strong>,{" "}
              <strong className="text-gray-700">LinkedIn post</strong>,{" "}
              <strong className="text-gray-700">pitch script</strong>, or{" "}
              <strong className="text-gray-700">interview answer</strong> — through
              a short AI-guided interview. No writing experience needed.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-brand-accent)" }}
              >
                Start for free — it takes 5 minutes
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z" />
                </svg>
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors bg-white"
              >
                See how it works
              </Link>
            </div>

            {/* Micro social proof */}
            <p className="text-xs text-gray-400">
              Covers{" "}
              <span className="font-semibold text-gray-600">180+</span>{" "}
              HELB-approved institutions · Free to use
            </p>
          </div>

          {/* ── Right: output preview card ── */}
          <div className="relative">
            {/* Outer glow / depth layer */}
            <div
              className="absolute inset-0 rounded-2xl translate-x-2 translate-y-2"
              style={{ backgroundColor: "#CCFBF1" }}
            />
            <div
              className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    AI-generated output
                  </p>
                  <p
                    className="text-sm font-bold mt-0.5"
                    style={{ color: "var(--color-brand-text)" }}
                  >
                    Smart Irrigation System
                  </p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "#FEF3C7",
                    color: "#92400E",
                  }}
                >
                  LinkedIn Post
                </span>
              </div>

              {/* Fake LinkedIn post content */}
              <div className="space-y-2.5 text-sm text-gray-700 leading-relaxed">
                <p>
                  🌱 I built a smart irrigation controller using Arduino and
                  GSM — and it&apos;s now helping farmers in my community cut
                  water waste by 40%.
                </p>
                <p>
                  Here&apos;s what I learned building it from scratch:
                </p>
                <p className="text-gray-500">
                  → Soil moisture sensors aren&apos;t just about reading data —
                  calibration for clay vs. loam soil matters enormously.
                  <br />
                  → A GSM module with a prepaid SIM is cheaper than Wi-Fi
                  for rural deployments and far more reliable.
                  <br />
                  → Writing the alert logic was harder than the hardware.
                </p>
                <p>
                  TVET gave me the hands to build it. SkillNarrate helped me
                  find the words to explain it.
                </p>
                <p className="text-gray-500">
                  #TVET #Engineering #Arduino #AgriTech #Kenya
                </p>
              </div>

              {/* Copy / regenerate action strip */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                <button
                  className="flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  disabled
                >
                  Copy to clipboard
                </button>
                <button
                  className="flex-1 py-2 text-xs font-semibold rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-brand-primary)" }}
                  disabled
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          STAT STRIP
      ─────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "180+", label: "TVET institutions covered" },
              { value: "4", label: "Output formats" },
              { value: "5 min", label: "Average interview time" },
              { value: "Free", label: "Always, for students" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <dt
                  className="text-2xl font-black"
                  style={{ color: "var(--color-brand-primary)" }}
                >
                  {value}
                </dt>
                <dd className="text-xs text-gray-500 mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          HOW IT WORKS
          id="how-it-works" so the nav links scroll here
      ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-brand-secondary)" }}
            >
              The process
            </p>
            <h2
              className="text-3xl font-black tracking-tight"
              style={{ color: "var(--color-brand-text)" }}
            >
              From project to portfolio in 4 steps
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto text-base">
              No writing experience needed. Just answer questions about what you built.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                n: "01",
                title: "Tell us your project",
                body: "Give it a name and a one-line description. That's all we need to get started.",
              },
              {
                n: "02",
                title: "Answer 6–8 questions",
                body: "Our AI interviews you about your project — the problem, your approach, what you used, what you learned.",
              },
              {
                n: "03",
                title: "Pick your format",
                body: "Choose: case study, LinkedIn post, pitch script, or interview answer. You can generate all four.",
              },
              {
                n: "04",
                title: "Publish or share",
                body: "Copy the text, edit it, or share your public SkillNarrate portfolio link directly.",
              },
            ].map(({ n, title, body }) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div
                  className="text-3xl font-black mb-4 leading-none"
                  style={{ color: "var(--color-brand-secondary)" }}
                >
                  {n}
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: "var(--color-brand-text)" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          OUTPUT FORMAT PREVIEWS
      ─────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ backgroundColor: "#F0FDFA" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-brand-secondary)" }}
            >
              What you get
            </p>
            <h2
              className="text-3xl font-black tracking-tight"
              style={{ color: "var(--color-brand-text)" }}
            >
              Four formats, one interview
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto text-base">
              Generate all four from a single conversation — or just the one you need right now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                type: "Case Study",
                icon: "📄",
                color: "#CCFBF1",
                borderColor: "#5EEAD4",
                preview:
                  "Problem: Small-scale farmers in Nakuru County were wasting up to 60% of irrigation water due to manual scheduling. Solution: An Arduino-based automated system using soil moisture sensors and a GSM module for remote alerts...",
              },
              {
                type: "LinkedIn Post",
                icon: "💼",
                color: "#FEF3C7",
                borderColor: "#FDE68A",
                preview:
                  "🌱 I built a smart irrigation controller using Arduino and GSM — and it's now helping farmers cut water waste by 40%. Here's what I learned building it from scratch...",
              },
              {
                type: "Pitch Script",
                icon: "🎤",
                color: "#FEE2E2",
                borderColor: "#FECACA",
                preview:
                  "Imagine you're a farmer who gets an SMS alert at 2am telling you your crops are stressed — before any damage is done. That's what I built. My name is Frank, and this is SmartFarm...",
              },
              {
                type: "Interview Answer",
                icon: "🗣️",
                color: "#EDE9FE",
                borderColor: "#C4B5FD",
                preview:
                  "\"Tell me about a project you're proud of.\" — I built an automated irrigation controller during my final year at Eldoret National Polytechnic. The challenge was...",
              },
            ].map(({ type, icon, color, borderColor, preview }) => (
              <div
                key={type}
                className="bg-white rounded-2xl border p-6"
                style={{ borderColor }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: color }}
                  >
                    {icon}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--color-brand-text)" }}
                  >
                    {type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          CTA BAND
      ─────────────────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: "var(--color-brand-primary)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white tracking-tight mb-4">
            Ready to tell your story?
          </h2>
          <p className="text-teal-100 text-base mb-8 leading-relaxed">
            Create your free account in 30 seconds. No credit card, no writing
            skills needed — just the project you already built.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-xl font-bold text-sm shadow-lg transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--color-brand-secondary)",
              color: "var(--color-brand-text)",
            }}
          >
            Get started free →
          </Link>
          <p className="text-teal-200 text-xs mt-4">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
