/*
 * src/app/(marketing)/loading.tsx
 *
 * Loading skeleton for public marketing pages (about, support, portfolio).
 * Shown while a Server Component page fetches its data.
 */

export default function MarketingLoading() {
  return (
    <div className="pt-32 px-6 max-w-3xl mx-auto animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded mb-5" />
      <div className="h-10 w-3/4 bg-gray-200 rounded-lg mb-4" />
      <div className="h-5 w-full bg-gray-100 rounded mb-2" />
      <div className="h-5 w-5/6 bg-gray-100 rounded mb-2" />
      <div className="h-5 w-4/6 bg-gray-100 rounded mb-12" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-3" />
            <div className="h-3 w-full bg-gray-100 rounded mb-1" />
            <div className="h-3 w-5/6 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
