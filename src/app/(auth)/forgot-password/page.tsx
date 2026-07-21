/*
 * src/app/(auth)/forgot-password/page.tsx  →  URL: /forgot-password
 *
 * Password reset request form.
 * Wrapped in Suspense because useSearchParams() requires it in Next.js App Router.
 */

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";
import Spinner from "@/components/ui/Spinner";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [pending, setPending] = useState(false);

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-brand-primary)" }}
        >
          Forgot your password?
        </h1>
        <p className="text-sm text-gray-500">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form
        action={async (formData) => {
          setPending(true);
          await forgotPasswordAction(formData);
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

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          {pending && <Spinner size={14} color="#fff" />}
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link
          href="/login"
          className="hover:underline"
          style={{ color: "var(--color-brand-primary)" }}
        >
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
