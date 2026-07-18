/*
 * src/app/auth/reset-password/page.tsx  →  URL: /auth/reset-password
 *
 * The "set new password" form.
 * Users land here after clicking the password reset link in their email.
 *
 * WHY THE SUSPENSE WRAPPER?
 * useSearchParams() reads the URL query string on the client.
 * Next.js requires any component that uses useSearchParams() to be
 * wrapped in a <Suspense> boundary, because during static pre-rendering
 * there is no URL to read from. Suspense tells Next.js "render a fallback
 * while we wait for client-side data to be available".
 */

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/lib/actions/auth";

// The inner component uses the hook — must be inside Suspense
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [pending, setPending] = useState(false);

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--color-brand-primary)" }}
      >
        Set new password
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Choose a strong password for your SkillNarrate account.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New password
          </label>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            placeholder="At least 8 characters"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm new password
          </label>
          <input
            name="confirm_password"
            type="password"
            minLength={8}
            required
            placeholder="Repeat your password"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

// The exported page wraps the form in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
