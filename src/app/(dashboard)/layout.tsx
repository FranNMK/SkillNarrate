/*
 * src/app/(dashboard)/layout.tsx
 *
 * Route group: (dashboard)
 * ─────────────────────────
 * All logged-in pages share this layout.
 * In Phase 1+ we'll add:
 *  - A sidebar / top nav component
 *  - An auth guard (redirect to /login if no session)
 *  - A Supabase session context provider
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-brand-bg)" }}>
      {/* Placeholder nav bar */}
      <header
        className="h-14 flex items-center px-6 border-b border-gray-200 bg-white"
      >
        <span
          className="font-bold text-lg"
          style={{ color: "var(--color-brand-primary)" }}
        >
          SkillNarrate
        </span>
        <span className="ml-2 text-xs text-gray-400">(nav coming Phase 1)</span>
      </header>

      {/* Page content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
