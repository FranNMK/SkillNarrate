/*
 * src/components/marketing/Footer.tsx
 *
 * Shared footer for public marketing pages.
 * Server Component (no interactivity needed).
 */

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* ── Brand column ── */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              <Image
                src="/images/logo.png"
                alt="SkillNarrate"
                width={32}
                height={32}
                className="rounded-md"
              />
              <span className="font-bold text-sm" style={{ color: "var(--color-brand-text)" }}>
                SkillNarrate
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mt-0">
              Helping Kenya&apos;s TVET and technical students tell the story of
              what they built — clearly, confidently, and professionally.
            </p>
            <p
              className="text-xs font-semibold mt-3 tracking-wide"
              style={{ color: "var(--color-brand-secondary)" }}
            >
              Build it. Tell it. Own it.
            </p>
          </div>

          {/* ── Product column ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Product
            </p>
            <ul className="space-y-2">
              {[
                { href: "/#how-it-works", label: "How It Works" },
                { href: "/signup", label: "Get Started Free" },
                { href: "/login", label: "Sign In" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company column ── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Company
            </p>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About" },
                { href: "/support", label: "Support" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {currentYear} SkillNarrate. Built for the AI Builders Challenge with IBM Bob.
          </p>
          <p className="text-xs text-gray-400">
            AI powered by{" "}
            <span className="font-medium" style={{ color: "var(--color-brand-primary)" }}>
              Google Gemini
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
