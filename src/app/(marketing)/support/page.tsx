/*
 * src/app/support/page.tsx  →  URL: /support
 *
 * Support / Contact page.
 *
 * This uses a simple mailto: link as the contact method — no backend needed.
 * In a later phase we could replace this with a proper form routed
 * through Resend, but a mailto: link is zero-infrastructure, works immediately,
 * and is perfectly fine for a student-facing support inbox.
 */

import Link from "next/link";

export const metadata = {
  title: "Support",
  description:
    "Get help with SkillNarrate — FAQs, contact information, and troubleshooting guides.",
};

const SUPPORT_EMAIL = "frankmk2025@gmail.com";

const FAQS = [
  {
    q: "Is SkillNarrate free to use?",
    a: "Yes — completely free for students. We built this tool specifically for TVET and technical students in Kenya and want cost to be zero barrier.",
  },
  {
    q: "What kinds of projects can I add?",
    a: "Anything you built, coded, designed, fabricated, or engineered. Software apps, hardware prototypes, electrical systems, fashion collections, plumbing systems — all valid. The AI is trained to ask good questions about any technical domain.",
  },
  {
    q: "How does the AI interview work?",
    a: "After you add a project, our AI (powered by Google Gemini) asks you 6–8 questions about it — the problem it solves, how you built it, what you learned, what challenges you faced. You just answer naturally, like chatting. Then it generates your chosen output format.",
  },
  {
    q: "Can I edit the generated content?",
    a: "Yes. Every output is editable before you copy or publish it. Think of the AI output as a strong first draft, not a final document. You know your project best — always review and personalise.",
  },
  {
    q: "What is a portfolio link?",
    a: "Once you've generated outputs you're happy with, you can enable a public portfolio page — a shareable URL like skillnarrate.com/portfolio/yourname. Anyone with the link can view your published outputs, no login required.",
  },
  {
    q: "My institution isn't on the list — what do I do?",
    a: "Our list covers 180 HELB-approved TVET institutions in Kenya. If yours isn't listed, email us and we'll add it. You can also type your institution name manually in the course field for now.",
  },
  {
    q: "I signed up but didn't receive a confirmation email.",
    a: "Check your spam or junk folder first. If it's not there after 5 minutes, try signing up again with the same email — our system will resend. If it still doesn't arrive, contact us using the link below.",
  },
];

export default function SupportPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-brand-secondary)" }}
          >
            Help centre
          </p>
          <h1
            className="text-4xl font-black tracking-tight leading-tight mb-4"
            style={{ color: "var(--color-brand-text)" }}
          >
            How can we help?
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Browse the FAQs below. If you don&apos;t find what you need,
            reach out directly — we respond within 24 hours.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-white rounded-xl border border-gray-200 open:shadow-sm transition-shadow"
            >
              <summary
                className="flex items-center justify-between px-6 py-4 cursor-pointer list-none select-none"
                style={{ color: "var(--color-brand-text)" }}
              >
                <span className="text-sm font-semibold pr-4">{q}</span>
                {/* Chevron rotates when open — CSS group trick */}
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs group-open:rotate-45 transition-transform duration-200"
                  style={{ backgroundColor: "var(--color-brand-primary)" }}
                >
                  +
                </span>
              </summary>
              <div className="px-6 pb-5 pt-1">
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Contact card ── */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6"
            style={{
              background: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
            }}
          >
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-200 mb-2">
                Still need help?
              </p>
              <h2 className="text-xl font-black text-white mb-1">
                Send us a message
              </h2>
              <p className="text-teal-100 text-sm leading-relaxed">
                Email us at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-white underline underline-offset-2 font-semibold"
                >
                  {SUPPORT_EMAIL}
                </a>
                . Describe your issue and we&apos;ll get back to you within
                one business day.
              </p>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=SkillNarrate Support Request`}
              className="shrink-0 inline-block px-6 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--color-brand-secondary)",
                color: "var(--color-brand-text)",
              }}
            >
              Email support →
            </a>
          </div>
        </div>
      </section>

      {/* ── Back to home ── */}
      <div className="pb-16 px-6 text-center">
        <Link
          href="/"
          className="text-sm hover:underline"
          style={{ color: "var(--color-brand-primary)" }}
        >
          ← Back to homepage
        </Link>
      </div>
    </>
  );
}
