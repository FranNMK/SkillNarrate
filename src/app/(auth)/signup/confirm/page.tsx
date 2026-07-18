/*
 * src/app/(auth)/signup/confirm/page.tsx  →  URL: /signup/confirm
 *
 * "Check your email" page shown immediately after signup.
 * The user can't proceed until they click the confirmation link.
 */

import Link from "next/link";

export const metadata = { title: "Check your email" };

export default function SignupConfirmPage() {
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
      {/* Email icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
        style={{ backgroundColor: "#CCFBF1" }}
      >
        ✉️
      </div>

      <h1
        className="text-2xl font-bold mb-3"
        style={{ color: "var(--color-brand-primary)" }}
      >
        Check your inbox
      </h1>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        We&apos;ve sent a confirmation link to your email address.
        Click it to activate your account and get started.
      </p>

      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-left text-sm text-amber-800 mb-6">
        <p className="font-semibold mb-1">Didn&apos;t get the email?</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered the right email address</li>
          <li>Wait a minute — delivery can take a moment</li>
        </ul>
      </div>

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
