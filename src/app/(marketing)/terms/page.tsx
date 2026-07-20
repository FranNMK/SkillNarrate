/*
 * src/app/(marketing)/terms/page.tsx  →  URL: /terms
 *
 * Terms of Service page for SkillNarrate.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SkillNarrate",
  description: "The terms and conditions governing use of the SkillNarrate platform.",
};

const LAST_UPDATED = "January 2025";
const CONTACT_EMAIL = "frankmk2025@gmail.com";

export default function TermsOfServicePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="pt-32 pb-10 px-6">
        <div className="max-w-3xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--color-brand-secondary)" }}
          >
            Legal
          </p>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3"
            style={{ color: "var(--color-brand-text)" }}
          >
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-10 text-gray-700 text-sm leading-relaxed">

          {/* Intro banner */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-6 py-4 text-amber-800 text-sm">
            <strong>Plain-language summary:</strong> SkillNarrate is a free tool for students.
            Use it honestly for your own real projects. Don&apos;t misuse it, don&apos;t try to
            harm the platform, and don&apos;t submit false academic work through it.
          </div>

          <TermsSection title="1. Acceptance of terms">
            <p>
              By creating an account on SkillNarrate (&quot;the platform&quot;, &quot;we&quot;, &quot;us&quot;), you
              agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not
              agree with any part of these Terms, do not use the platform.
            </p>
            <p className="mt-3">
              These Terms apply to all users of SkillNarrate, including students,
              visitors to public portfolio pages, and any other person who accesses
              the platform.
            </p>
          </TermsSection>

          <TermsSection title="2. Description of service">
            <p>
              SkillNarrate is a free web application that helps TVET (Technical and
              Vocational Education and Training) and technical students in Kenya:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>Document their technical projects through AI-guided interviews.</li>
              <li>Generate professional portfolio content (case studies, LinkedIn posts, pitch scripts, interview answers) using Google Gemini AI.</li>
              <li>Create a shareable public portfolio page to present their work to employers and institutions.</li>
            </ul>
            <p className="mt-3">
              The service is provided free of charge to students. We reserve the right
              to introduce premium features in the future, but the core functionality
              will remain free.
            </p>
          </TermsSection>

          <TermsSection title="3. Eligibility">
            <p>To use SkillNarrate, you must:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>Be at least 13 years of age (16+ recommended for TVET students).</li>
              <li>Provide accurate information when creating your account.</li>
              <li>Have authority to agree to these Terms (if you are under 18, you should have parental consent).</li>
            </ul>
          </TermsSection>

          <TermsSection title="4. Your account">
            <p>When you create a SkillNarrate account:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must notify us immediately at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "var(--color-brand-primary)" }}>
                  {CONTACT_EMAIL}
                </a>{" "}
                if you suspect unauthorised access to your account.
              </li>
              <li>You may not create multiple accounts for the purpose of circumventing any restrictions.</li>
              <li>You may not share your account with others.</li>
            </ul>
          </TermsSection>

          <TermsSection title="5. Acceptable use">
            <p>You agree to use SkillNarrate only for lawful purposes and in a manner that
              does not infringe the rights of others. Specifically, you must not:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>Submit project descriptions or interview answers that are plagiarised, fabricated, or that misrepresent someone else&apos;s work as your own.</li>
              <li>Use the AI-generated content to deceive academic institutions, employers, or other parties.</li>
              <li>Upload or link to content that is defamatory, obscene, harmful, or violates any applicable law.</li>
              <li>Attempt to reverse engineer, scrape, or extract data from the platform.</li>
              <li>Use automated bots or scripts to interact with the AI interview system.</li>
              <li>Attempt to circumvent, disable, or interfere with the security features of the platform.</li>
              <li>Use the platform to generate content that promotes discrimination, harassment, or violence.</li>
              <li>Impersonate another person or entity on your public portfolio page.</li>
            </ul>
          </TermsSection>

          <TermsSection title="6. Your content and ownership">
            <p>
              <strong>You own your content.</strong> The project descriptions, interview
              answers, and portfolio information you submit to SkillNarrate remain your
              intellectual property. We do not claim ownership over any content you create.
            </p>
            <p className="mt-3">
              By submitting content to the platform, you grant SkillNarrate a limited,
              non-exclusive, royalty-free licence to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>Store and process your content to provide the service.</li>
              <li>Display your content on your public portfolio page (only when you have enabled it).</li>
              <li>Send your interview answers to the Google Gemini API for content generation.</li>
            </ul>
            <p className="mt-3">
              This licence ends when you delete your content or your account.
              We will not use your content for any other purpose.
            </p>
          </TermsSection>

          <TermsSection title="7. AI-generated content">
            <p>
              The content generated by SkillNarrate (case studies, LinkedIn posts, etc.)
              is produced by the Google Gemini AI model based on your interview answers.
            </p>
            <p className="mt-3">Important limitations you must understand:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li><strong>Review before publishing:</strong> AI-generated content may contain inaccuracies, generalisations, or statements that do not accurately reflect your project. Always review and verify content before publishing or submitting it.</li>
              <li><strong>Not a guarantee:</strong> We make no guarantee about the accuracy, quality, or fitness of the generated content for any specific purpose.</li>
              <li><strong>Your responsibility:</strong> You are responsible for the content you publish on your public portfolio. Ensure it is accurate and does not misrepresent your experience.</li>
              <li><strong>Academic integrity:</strong> Using AI-generated content to submit as your own academic work in assessments may violate your institution&apos;s academic integrity policy. Check your institution&apos;s rules before using generated content in assessed work.</li>
            </ul>
          </TermsSection>

          <TermsSection title="8. Public portfolio pages">
            <p>
              When you enable your public portfolio (via Portfolio Settings), a
              publicly-accessible URL is created (e.g., skillnarrate.com/portfolio/your-name).
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>Only outputs you explicitly mark as &quot;Published&quot; will appear on your public portfolio.</li>
              <li>You can deactivate your portfolio at any time, which immediately removes public access.</li>
              <li>You are responsible for the content you choose to publish publicly.</li>
              <li>We reserve the right to remove any public portfolio content that violates these Terms.</li>
            </ul>
          </TermsSection>

          <TermsSection title="9. Termination">
            <p>
              <strong>By you:</strong> You may stop using SkillNarrate at any time. To
              permanently delete your account and all associated data, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "var(--color-brand-primary)" }}>
                {CONTACT_EMAIL}
              </a>.
            </p>
            <p className="mt-3">
              <strong>By us:</strong> We reserve the right to suspend or terminate your
              account, without notice, if you violate these Terms, use the platform
              fraudulently, or engage in activity that harms other users or the platform
              itself. In cases of serious misuse, we may report activity to relevant
              authorities.
            </p>
          </TermsSection>

          <TermsSection title="10. Disclaimers and limitation of liability">
            <p>
              SkillNarrate is provided <strong>&quot;as is&quot; and &quot;as available&quot;</strong> without
              warranties of any kind, express or implied. We do not warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>The platform will be uninterrupted, error-free, or secure at all times.</li>
              <li>AI-generated content will be accurate, complete, or suitable for your purposes.</li>
              <li>The platform will meet your specific educational or career requirements.</li>
            </ul>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, SkillNarrate and its
              operators shall not be liable for any indirect, incidental, consequential,
              or special damages arising from your use of the platform, including but not
              limited to lost opportunities, academic outcomes, or employment decisions.
            </p>
            <p className="mt-3">
              Our total liability to you for any claim arising from use of the platform
              shall not exceed the amount you have paid to us (which, as the platform
              is free, is zero).
            </p>
          </TermsSection>

          <TermsSection title="11. Third-party services">
            <p>
              SkillNarrate integrates with the following third-party services. Their
              terms and privacy policies apply to their respective services:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>
                <strong>Google Gemini API</strong> — AI content generation.{" "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--color-brand-primary)" }}>
                  Google Terms of Service
                </a>
              </li>
              <li>
                <strong>Supabase</strong> — Database and authentication.{" "}
                <a href="https://supabase.com/terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--color-brand-primary)" }}>
                  Supabase Terms
                </a>
              </li>
              <li>
                <strong>Resend</strong> — Transactional email delivery.{" "}
                <a href="https://resend.com/terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--color-brand-primary)" }}>
                  Resend Terms
                </a>
              </li>
            </ul>
          </TermsSection>

          <TermsSection title="12. Changes to these terms">
            <p>
              We may update these Terms from time to time. We will notify you of
              significant changes by email or by displaying a notice on the platform.
              The &quot;Last updated&quot; date at the top of this page will always reflect
              the most recent revision.
            </p>
            <p className="mt-3">
              Continuing to use SkillNarrate after updated Terms are posted constitutes
              your acceptance of the new Terms.
            </p>
          </TermsSection>

          <TermsSection title="13. Governing law">
            <p>
              These Terms are governed by and construed in accordance with the laws of
              Kenya. Any disputes arising from these Terms or your use of SkillNarrate
              shall be subject to the jurisdiction of the courts of Kenya.
            </p>
          </TermsSection>

          <TermsSection title="14. Contact us">
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="mt-3 bg-gray-50 rounded-xl px-5 py-4 border border-gray-200">
              <p className="font-semibold text-gray-800 text-sm">SkillNarrate</p>
              <p className="text-gray-500 mt-1">
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "var(--color-brand-primary)" }}>
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </TermsSection>

          {/* Navigation */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <Link
              href="/privacy"
              className="text-sm hover:underline"
              style={{ color: "var(--color-brand-primary)" }}
            >
              Read our Privacy Policy →
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
            >
              ← Back to homepage
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Helper: section wrapper ──────────────────────────────────
function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        className="text-base font-bold mb-3 pb-2 border-b border-gray-100"
        style={{ color: "var(--color-brand-text)" }}
      >
        {title}
      </h2>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}
