/*
 * src/app/(auth)/login/page.tsx  →  URL: /login
 *
 * Login page — email/password + Google OAuth
 *
 * WHY "use client"?
 * We use useState to track the loading/pending state of the form.
 * The actual auth logic (Server Actions) still runs on the server.
 *
 * WHY THE SUSPENSE WRAPPER?
 * useSearchParams() requires a <Suspense> boundary in Next.js App Router.
 * The exported page wraps the inner form component so the build passes.
 */

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInAction, signInWithGoogleAction } from "@/lib/actions/auth";
import Spinner from "@/components/ui/Spinner";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-brand-primary)" }}
        >
          Welcome back
        </h1>
        <p className="text-sm text-gray-500">Sign in to your SkillNarrate account</p>
      </div>

      {/* ── Error / info banner ── */}
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {message && !error && (
        <div className="mb-5 p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-sm">
          {message}
        </div>
      )}

      {/* ── Google OAuth button ── */}
      <form
        action={async () => {
          setGooglePending(true);
          await signInWithGoogleAction();
        }}
      >
        <button
          type="submit"
          disabled={googlePending || pending}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 mb-5"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.02a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          {googlePending ? "Redirecting to Google…" : "Continue with Google"}
        </button>
      </form>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── Email + password form ── */}
      <form
        action={async (formData) => {
          setPending(true);
          await signInAction(formData);
          setPending(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs hover:underline"
              style={{ color: "var(--color-brand-primary)" }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Your password"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={pending || googlePending}
          className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          {pending && <Spinner size={14} color="#fff" />}
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* ── Footer ── */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold hover:underline"
          style={{ color: "var(--color-brand-primary)" }}
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
