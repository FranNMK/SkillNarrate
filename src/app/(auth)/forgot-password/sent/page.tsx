/*
 * src/app/(auth)/forgot-password/sent/page.tsx  →  URL: /forgot-password/sent
 *
 * Shown after the password reset email is sent.
 */

import Link from "next/link";

export const metadata = { title: "Reset email sent" };

export default function ForgotPasswordSentPage() {
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
        style={{ backgroundColor: "#CCFBF1" }}
      >
        🔐
      </div>

      <h1
        className="text-2xl font-bold mb-3"
        style={{ color: "var(--color-brand-primary)" }}
      >
        Reset link sent
      </h1>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        If that email address is registered, you&apos;ll receive a password
        reset link within a few minutes. Check your spam folder if you don&apos;t see it.
      </p>

      <Link
        href="/login"
        className="text-sm hover:underline"
        style={{ color: "var(--color-brand-primary)" }}
      >
        Back to sign in
      </Link>
    </div>
  );
}
