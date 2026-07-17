/*
 * src/app/(auth)/login/page.tsx  →  URL: /login
 *
 * Placeholder for the login page.
 * Phase 1 will replace this with a real Supabase auth form.
 */

export default function LoginPage() {
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--color-brand-primary)" }}
      >
        Welcome back
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Sign in to your SkillNarrate account
      </p>
      <p className="text-center text-xs text-gray-400 mt-8">
        🚧 Auth form coming in Phase 1
      </p>
    </div>
  );
}
