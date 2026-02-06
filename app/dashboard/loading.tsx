export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 shimmer-bg rounded-lg" />
        <div className="mt-2 h-4 w-80 shimmer-bg rounded" />
      </div>

      {/* Address form card skeleton */}
      <div className="card overflow-hidden">
        <div className="h-[3px] w-full shimmer-bg" />
        <div className="p-6">
          <div className="h-12 w-full shimmer-bg rounded-xl" />
          <div className="mt-4 flex gap-3">
            <div className="h-10 w-32 shimmer-bg rounded-xl" />
          </div>
        </div>
      </div>

      {/* Results skeleton */}
      <div className="mt-8 space-y-8">
        {/* Property info skeleton */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-5 w-5 shimmer-bg rounded" />
            <div className="h-5 w-40 shimmer-bg rounded" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-48 shimmer-bg rounded-xl" />
            <div className="space-y-3">
              <div className="h-8 w-48 shimmer-bg rounded" />
              <div className="h-4 w-64 shimmer-bg rounded" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 shimmer-bg rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Roof results skeleton */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-5 w-5 shimmer-bg rounded" />
            <div className="h-5 w-36 shimmer-bg rounded" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 h-28 shimmer-bg rounded-xl" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 shimmer-bg rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
