/*
 * src/components/marketing/Navbar.tsx
 *
 * Public marketing navbar — used on /, /about, /support
 *
 * "use client" because we need useState for the mobile menu toggle.
 * The nav links themselves are plain <a> tags (no client-side routing
 * needed — these are all separate pages, not SPA transitions).
 */

"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/support", label: "Support" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ── Brand ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {/* Logomark: a teal square with a white "S" */}
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            SN
          </span>
          <span
            className="font-bold text-base tracking-tight"
            style={{ color: "var(--color-brand-text)" }}
          >
            SkillNarrate
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop auth buttons ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
          >
            Get started free
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
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
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
            <Link
              href="/login"
              className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
              onClick={() => setMobileOpen(false)}
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
