/*
 * src/app/(dashboard)/layout.tsx
 *
 * Shared layout for all logged-in pages (/dashboard, /onboarding in future, etc.)
 *
 * This is a SERVER COMPONENT — it reads the user session and profile
 * from the database to show the user's name in the nav.
 *
 * WHY READ THE PROFILE HERE (not in each page)?
 * Every logged-in page needs the nav bar with the user's name.
 * Putting the DB read in the layout means it happens ONCE per
 * navigation, shared across all child pages — not duplicated.
 */

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get the logged-in user (from session cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get their profile for the display name
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .returns<{ full_name: string | null }[]>()
        .single()
    : { data: null };

  // Build the display name: profile name → email prefix → fallback
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  // First letter for the avatar circle
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-brand-bg)" }}>
      {/* ── Top nav ── */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/logo.png"
            alt="SkillNarrate"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span
            className="font-bold text-lg"
            style={{ color: "var(--color-brand-primary)" }}
          >
            SkillNarrate
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1 ml-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            My Projects
          </Link>
          <Link
            href="/projects/new"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            + New Project
          </Link>
          <Link
            href="/settings/portfolio"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Portfolio
          </Link>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User section */}
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
            title={displayName}
          >
            {avatarInitial}
          </div>

          {/* Display name — hidden on very small screens */}
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {displayName}
          </span>

          {/* Sign out */}
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
