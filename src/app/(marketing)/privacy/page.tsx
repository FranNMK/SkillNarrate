/*
 * src/app/(marketing)/privacy/page.tsx  →  URL: /privacy
 *
 * Privacy Policy page for SkillNarrate.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SkillNarrate",
  description: "How SkillNarrate collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "July 2026";
const CONTACT_EMAIL = "frankmk2025@gmail.com";
const APP_URL = "https://skillnarrate.com";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-10 text-gray-700 text-sm leading-relaxed">

          {/* Intro */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 text-blue-800 text-sm">
            <strong>Plain-language summary:</strong> We collect only what we need to
            run SkillNarrate. We never sell your data. You can delete your account
            and all your data at any time by contacting us.
          </div>

          <PolicySection title="1. Who we are">
            <p>
              SkillNarrate (&quot;we&quot;, &quot;our&quot;, &quot;the platform&quot;) is a free tool that helps
              TVET and technical students in Kenya document their projects and generate
              professional portfolio content using AI.
            </p>
            <p className="mt-3">
              This platform is operated by the SkillNarrate team. If you have any
              questions about this policy, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "var(--color-brand-primary)" }}>
                {CONTACT_EMAIL}
              </a>.
            </p>
          </PolicySection>

          <PolicySection title="2. What information we collect">
            <p className="font-semibold text-gray-800 mb-2">Information you give us directly:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li><strong>Account details:</strong> Your email address and password (or Google OAuth token) when you sign up.</li>
              <li><strong>Profile information:</strong> Your full name, course/field of study, expected graduation year, TVET institution, and optionally a profile photo URL — entered during onboarding or in profile settings.</li>
              <li><strong>Project data:</strong> The project titles, descriptions, and interview answers you provide when using the AI interview feature.</li>
              <li><strong>Project links:</strong> Optional GitHub, live demo, demo video, and logo URLs you add to projects.</li>
            </ul>

            <p className="font-semibold text-gray-800 mt-5 mb-2">Information collected automatically:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li><strong>Usage data:</strong> Pages visited, features used, timestamps of activity — collected through standard server logs.</li>
              <li><strong>Session cookies:</strong> Supabase authentication tokens stored in secure HTTP-only cookies to keep you logged in.</li>
            </ul>

            <p className="font-semibold text-gray-800 mt-5 mb-2">Information we do NOT collect:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li>We do not collect payment information (SkillNarrate is free).</li>
              <li>We do not use advertising trackers or third-party analytics pixels.</li>
              <li>We do not collect your physical location or device identifiers.</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. How we use your information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li>Create and manage your account.</li>
              <li>Power the AI interview — your answers are sent to the Google Gemini API to generate your portfolio content.</li>
              <li>Display your public portfolio page (only if you choose to enable it).</li>
              <li>Send you a welcome email when you first sign up.</li>
              <li>Improve the platform by understanding how features are used (in aggregate, not individually).</li>
              <li>Respond to support requests you send us.</li>
            </ul>
            <p className="mt-4 text-gray-500 italic">
              We will never use your interview answers or project content for training AI models, selling to third parties, or any purpose beyond the above.
            </p>
          </PolicySection>

          <PolicySection title="4. AI processing (Google Gemini)">
            <p>
              SkillNarrate uses the <strong>Google Gemini API</strong> to generate your
              portfolio content from your interview answers. When you complete an
              interview, your project title and your question-and-answer responses
              are sent to Gemini for processing.
            </p>
            <p className="mt-3">
              Google&apos;s handling of this data is governed by the{" "}
              <a href="https://cloud.google.com/terms/data-processing-terms" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--color-brand-primary)" }}>
                Google Cloud Data Processing Addendum
              </a>
              . We use the Gemini API under its standard terms, which include data
              privacy protections for API customers.
            </p>
            <p className="mt-3">
              <strong>Important:</strong> Do not include sensitive personal information
              (ID numbers, financial data, medical data) in your project descriptions
              or interview answers. Only describe the technical aspects of your project.
            </p>
          </PolicySection>

          <PolicySection title="5. Data storage and security">
            <p>
              Your data is stored on <strong>Supabase</strong>, a secure database
              platform hosted on AWS infrastructure in Europe (eu-west-1). All data
              is encrypted at rest and in transit (TLS 1.3).
            </p>
            <p className="mt-3">
              We use Row-Level Security (RLS) policies on all database tables, meaning
              each user can only read and write their own data — even at the database
              level. Your portfolio, projects, and interview answers are never accessible
              to other users.
            </p>
            <p className="mt-3">
              Your public portfolio page (if enabled) is intentionally visible to
              anyone with the link — that is its purpose. You can deactivate your
              portfolio link at any time from{" "}
              <Link href="/settings/portfolio" className="underline" style={{ color: "var(--color-brand-primary)" }}>
                Portfolio Settings
              </Link>.
            </p>
          </PolicySection>

          <PolicySection title="6. Sharing your information">
            <p>We do not sell, rent, or share your personal data with third parties, except:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li><strong>Google Gemini API:</strong> Your interview Q&amp;As are processed by Gemini to generate content (see Section 4).</li>
              <li><strong>Resend:</strong> Your email address is used by Resend (our transactional email provider) to send the welcome email when you sign up. Resend does not use your email for marketing.</li>
              <li><strong>Supabase:</strong> Your data is stored on Supabase infrastructure. Supabase is a data processor, not a data controller.</li>
              <li><strong>Legal requirements:</strong> If required by law, court order, or to protect the rights and safety of users.</li>
            </ul>
          </PolicySection>

          <PolicySection title="7. Your rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 mt-3">
              <li><strong>Access your data:</strong> Request a copy of all data we hold about you.</li>
              <li><strong>Correct your data:</strong> Update your profile information at any time in{" "}
                <Link href="/settings/profile" className="underline" style={{ color: "var(--color-brand-primary)" }}>Profile Settings</Link>.
              </li>
              <li><strong>Delete your data:</strong> Request deletion of your account and all associated data by emailing us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "var(--color-brand-primary)" }}>{CONTACT_EMAIL}</a>.
                We will process deletion requests within 14 days.
              </li>
              <li><strong>Withdraw consent:</strong> You can deactivate your portfolio at any time, which immediately removes public access to your data.</li>
              <li><strong>Data portability:</strong> Request an export of your projects and generated content in a machine-readable format.</li>
            </ul>
          </PolicySection>

          <PolicySection title="8. Cookies">
            <p>We use the following cookies:</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-700">Cookie</th>
                    <th className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-700">Purpose</th>
                    <th className="text-left px-4 py-2 border border-gray-200 font-semibold text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200 font-mono">sb-auth-token</td>
                    <td className="px-4 py-2 border border-gray-200">Keeps you logged in (Supabase session)</td>
                    <td className="px-4 py-2 border border-gray-200">Session / 7 days</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 border border-gray-200 font-mono">welcome-shown</td>
                    <td className="px-4 py-2 border border-gray-200">Prevents welcome popup from showing twice</td>
                    <td className="px-4 py-2 border border-gray-200">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-gray-500">
              We do not use advertising cookies, tracking pixels, or third-party analytics cookies.
            </p>
          </PolicySection>

          <PolicySection title="9. Children's privacy">
            <p>
              SkillNarrate is intended for TVET students aged 16 and above. We do not
              knowingly collect personal data from children under 13. If you are a
              parent or guardian and believe your child has created an account, please
              contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "var(--color-brand-primary)" }}>
                {CONTACT_EMAIL}
              </a>{" "}
              and we will delete the account within 48 hours.
            </p>
          </PolicySection>

          <PolicySection title="10. Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will
              update the &quot;Last updated&quot; date at the top of this page and, for
              significant changes, notify you by email. Continuing to use SkillNarrate
              after a policy update constitutes acceptance of the new policy.
            </p>
          </PolicySection>

          <PolicySection title="11. Contact us">
            <p>
              For any privacy-related questions, requests, or complaints:
            </p>
            <div className="mt-3 bg-gray-50 rounded-xl px-5 py-4 border border-gray-200">
              <p className="font-semibold text-gray-800 text-sm">SkillNarrate</p>
              <p className="text-gray-500 mt-1">
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline" style={{ color: "var(--color-brand-primary)" }}>
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="text-gray-500">Website: <span className="font-mono text-xs">{APP_URL}</span></p>
            </div>
          </PolicySection>

          {/* Navigation */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <Link
              href="/terms"
              className="text-sm hover:underline"
              style={{ color: "var(--color-brand-primary)" }}
            >
              Read our Terms of Service →
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
function PolicySection({
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
