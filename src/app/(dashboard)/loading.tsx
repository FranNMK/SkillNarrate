/*
 * src/app/(dashboard)/loading.tsx
 *
 * WHY THIS FILE EXISTS:
 * In Next.js App Router, a `loading.tsx` file in a route segment is shown
 * automatically while the Server Component page is fetching data (streaming).
 * This replaces the blank white flash you'd get otherwise.
 *
 * Next.js wraps the page in a React Suspense boundary and shows this
 * component instantly (no data needed) while the real page loads.
 *
 * IMPORTANT: This only works for the initial navigation to a page.
 * For in-page loading states (like "clicking Generate"), we handle
 * those with React state in the Client Component itself.
 */

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header skeleton */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap animate-pulse">
        <div>
          <div className="h-7 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-xl" />
      </div>

      {/* Stats strip skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <div className="h-7 w-8 bg-gray-200 rounded mx-auto mb-1" />
            <div className="h-3 w-20 bg-gray-100 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Project list skeleton */}
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-56 bg-gray-100 rounded" />
            </div>
            <div className="h-7 w-20 bg-gray-100 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
