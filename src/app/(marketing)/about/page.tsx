/*
 * src/app/about/page.tsx  →  URL: /about
 *
 * About page — mission, vision, motto, team context.
 * Server Component (static).
 */

import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "SkillNarrate was built to help Kenya's TVET and technical students confidently communicate the value of what they've built.",
};

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-brand-secondary)" }}
          >
            Our story
          </p>
          <h1
            className="text-4xl font-black tracking-tight leading-tight mb-6"
            style={{ color: "var(--color-brand-text)" }}
          >
            We believe every student who built something
            <span style={{ color: "var(--color-brand-primary)" }}>
              {" "}deserves to be heard.
            </span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            SkillNarrate was created for the thousands of TVET and technical
            students across Kenya who graduate with real, working projects —
            and struggle to explain them in a job interview, a LinkedIn post,
            or a pitch to a potential employer.
          </p>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-3xl mx-auto px-6">
        <hr className="border-gray-200" />
      </div>

      {/* ── Mission / Vision / Motto ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* Mission */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: "var(--color-brand-secondary)" }}
              >
                Mission
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-lg font-semibold text-gray-800 leading-relaxed mb-3">
                To close the communication gap between what technical students
                build and how they're able to present it to the world.
              </p>
              <p className="text-base text-gray-500 leading-relaxed">
                In Kenya's TVET ecosystem, students are taught to build.
                They graduate with skills in electrical engineering, ICT,
                fashion design, automotive mechanics, and more. But the
                industry asks them to also <em>communicate</em> their skills —
                in CVs, interviews, LinkedIn profiles, and pitches. SkillNarrate
                bridges that gap using AI-guided conversation, not writing lessons.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: "var(--color-brand-secondary)" }}
              >
                Vision
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-lg font-semibold text-gray-800 leading-relaxed mb-3">
                A Kenya — and eventually an Africa — where no skilled graduate
                is overlooked because they couldn't find the words.
              </p>
              <p className="text-base text-gray-500 leading-relaxed">
                We imagine a future where technical competence and the ability
                to communicate it grow together. Where a student from a rural
                polytechnic has the same vocabulary to describe their project
                as someone who attended a top university.
              </p>
            </div>
          </div>

          {/* Motto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: "var(--color-brand-secondary)" }}
              >
                Motto
              </p>
            </div>
            <div className="md:col-span-2">
              <blockquote
                className="text-2xl font-black tracking-tight leading-snug mb-3"
                style={{ color: "var(--color-brand-primary)" }}
              >
                "Build it. Tell it. Own it."
              </blockquote>
              <p className="text-base text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Build it</strong> — you already did.
                Whatever you made in your lab, your workshop, your dorm room:
                that's real.{" "}
                <strong className="text-gray-700">Tell it</strong> — now let's give
                it language. A clear, honest story of what the project is,
                why it matters, and what it took.{" "}
                <strong className="text-gray-700">Own it</strong> — this is your
                work. Your ideas, your hands, your late nights. Walk into any
                room and claim it confidently.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Built for the AI Builders Challenge ── */}
      <section
        className="py-12 px-6 mx-6 mb-16 rounded-2xl"
        style={{ backgroundColor: "#F0FDFA", border: "1px solid #99F6E4" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--color-brand-primary)" }}
          >
            Hackathon context
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            SkillNarrate was built for the{" "}
            <strong>AI Builders Challenge with IBM Bob</strong> (July 2026,
            Creative Industries theme). IBM Bob is our primary development
            tool; Google Gemini powers the in-app AI interview engine.
            The project was created in Kenya, for Kenyan students first —
            with a vision to expand across the continent.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-24 px-6 text-center">
        <Link
          href="/signup"
          className="inline-block px-8 py-4 rounded-xl font-bold text-sm text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          Join SkillNarrate — it&apos;s free →
        </Link>
      </section>
    </>
  );
}
