/*
 * src/app/(auth)/layout.tsx
 *
 * Route group: (auth)
 * ────────────────────
 * The parentheses in "(auth)" are a Next.js App Router feature called a
 * "route group". The folder name is EXCLUDED from the URL path, so:
 *
 *   src/app/(auth)/login/page.tsx  →  /login   (not /auth/login)
 *
 * We use a group here so that auth pages (login, signup, reset-password)
 * share a different layout from the main app — typically a centered card
 * with the brand logo, no sidebar, no top nav.
 *
 * In Phase 1 we'll style this properly. For now it's just a passthrough.
 */

import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Logo above the card */}
      <Link href="/" className="flex items-center gap-2.5 mb-6">
        <Image
          src="/images/logo.png"
          alt="SkillNarrate"
          width={40}
          height={40}
          className="rounded-xl"
          priority
        />
        <span className="font-bold text-lg" style={{ color: "var(--color-brand-text)" }}>
          SkillNarrate
        </span>
      </Link>
      {children}
    </div>
  );
}
