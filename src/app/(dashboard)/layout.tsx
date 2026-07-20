/*
 * src/app/(dashboard)/layout.tsx
 *
 * Shared layout for all logged-in pages.
 *
 * SERVER COMPONENT — reads the user session and profile.
 * The mobile hamburger menu is handled by DashboardNav (client component
 * in this same file) which wraps only the interactive header parts.
 */

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/features/SignOutButton";
import DashboardMobileMenu from "@/components/features/DashboardMobileMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = user
    ? await (supabase as any)
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  const avatarInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl: string | null =
    (profile as { avatar_url?: string | null } | null)?.avatar_url ?? null;

  const navLinks = [
    { href: "/dashboard",          label: "My Projects" },
    { href: "/projects/new",       label: "+ New Project" },
    { href: "/settings/portfolio", label: "Portfolio" },
    { href: "/settings/profile",   label: "Profile" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-brand-bg)" }}>
      {/* ── Top nav ── */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-3">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/logo.png"
            alt="SkillNarrate"
            width={30}
            height={30}
            className="rounded-lg"
            priority
          />
          <span
            className="font-bold text-base sm:text-lg"
            style={{ color: "var(--color-brand-primary)" }}
          >
            SkillNarrate
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 ml-3">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop: Avatar + name + sign out */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/settings/profile" className="shrink-0" title="Edit your profile">
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
          <Link
            href="/settings/profile"
            className="text-sm font-medium text-gray-700 max-w-[120px] truncate hover:text-gray-900 transition-colors"
          >
            {displayName}
          </Link>
          <SignOutButton />
        </div>

        {/* Mobile: Avatar (links to profile) + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/settings/profile" className="shrink-0" title="My profile">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                {avatarInitial}
              </div>
            )}
          </Link>

          {/* Hamburger — client component handles open/close state */}
          <DashboardMobileMenu
            navLinks={navLinks}
            displayName={displayName}
            avatarUrl={avatarUrl}
            avatarInitial={avatarInitial}
          />
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="p-4 sm:p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
