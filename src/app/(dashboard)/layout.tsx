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
import SignOutButton from "@/components/features/SignOutButton";

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

  // Get their profile for the display name + avatar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = user
    ? await (supabase as any)
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  // Build the display name: profile name → email prefix → fallback
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  // Avatar: photo URL if set, otherwise first-letter initial
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl: string | null = (profile as { avatar_url?: string | null } | null)?.avatar_url ?? null;

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
          <Link
            href="/settings/profile"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Profile
          </Link>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User section */}
        <div className="flex items-center gap-3">
          {/* Avatar — links to profile settings */}
          <Link
            href="/settings/profile"
            className="shrink-0"
            title="Edit your profile"
          >
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity border border-gray-200"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                {avatarInitial}
              </div>
            )}
          </Link>

          {/* Display name — links to profile settings, hidden on very small screens */}
          <Link
            href="/settings/profile"
            className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate hover:text-gray-900 transition-colors"
          >
            {displayName}
          </Link>

          {/* Sign out — confirm dialog handled in client component */}
          <SignOutButton />
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
