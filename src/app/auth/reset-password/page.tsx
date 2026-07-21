/*
 * src/app/auth/reset-password/page.tsx  →  URL: /auth/reset-password
 *
 * The "set new password" form.
 * Users land here after clicking the password reset link in their email.
 * The callback route (/auth/callback) handles verifyOtp() first, so by the
 * time the user reaches this page the session is already established.
 */

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resetPasswordAction } from "@/lib/actions/auth";
import Spinner from "@/components/ui/Spinner";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-brand-primary)" }}
        >
          Set new password
        </h1>
        <p className="text-sm text-gray-500">
          Choose a strong password for your SkillNarrate account.
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
          await resetPasswordAction(formData);
          setPending(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm_password">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              name="confirm_password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="Repeat your password"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          {pending && <Spinner size={14} color="#fff" />}
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline"
          style={{ color: "var(--color-brand-primary)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Logo */}
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

      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
