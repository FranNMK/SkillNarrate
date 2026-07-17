/*
 * src/app/(dashboard)/dashboard/page.tsx  →  URL: /dashboard
 *
 * Main dashboard — shows the user's projects and lets them start a new interview.
 * Placeholder for Phase 0; real implementation in Phase 2.
 */

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-brand-text)" }}>
        My Projects
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Each project can be turned into a case study, LinkedIn post, pitch script, or interview answer.
      </p>

      {/* Empty state placeholder */}
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
        <p className="text-gray-400 text-sm">🚧 Project cards coming in Phase 2</p>
      </div>
    </div>
  );
}
