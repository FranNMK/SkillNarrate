"use client";
/*
 * src/components/features/DashboardMobileMenu.tsx
 *
 * Mobile hamburger menu for the dashboard layout.
 * This is a CLIENT COMPONENT because it needs useState for open/close.
 *
 * Renders a full-width slide-down drawer with:
 *  - All nav links
 *  - User name + avatar
 *  - Sign out button
 *
 * The drawer is positioned fixed so it overlaps page content and has
 * a semi-transparent backdrop that closes it on click.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import SignOutButton from "@/components/features/SignOutButton";

interface Props {
  navLinks: { href: string; label: string }[];
  displayName: string;
  avatarUrl: string | null;
  avatarInitial: string;
}

export default function DashboardMobileMenu({
  navLinks,
  displayName,
  avatarUrl,
  avatarInitial,
}: Props) {
  const [open, setOpen] = useState(false);

  // Close menu on route change (any navigation)
  useEffect(() => {
    const handleRouteChange = () => setOpen(false);
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // Prevent body scroll while menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Hamburger / close button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        {open ? (
          // X icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          // Hamburger icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          style={{ top: "56px" }} /* below the 14-unit (56px) header */
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      {open && (
        <div
          className="fixed left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg"
          style={{ top: "56px" }}
        >
          {/* User identity strip */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                {avatarInitial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              <Link
                href="/settings/profile"
                onClick={() => setOpen(false)}
                className="text-xs hover:underline"
                style={{ color: "var(--color-brand-primary)" }}
              >
                Edit profile →
              </Link>
            </div>
          </div>

          {/* Nav links */}
          <nav className="px-3 py-3 space-y-0.5">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Sign out row */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Signed in as <span className="font-medium text-gray-600 truncate max-w-[160px] inline-block align-bottom">{displayName}</span></p>
            <SignOutButton />
          </div>
        </div>
      )}
    </>
  );
}
