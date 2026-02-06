export function PopulationDensitySkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="section-header">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 shimmer-bg rounded" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-5 w-40 shimmer-bg rounded" />
              <div className="h-5 w-16 shimmer-bg rounded-full" />
            </div>
            <div className="mt-2 h-4 w-48 shimmer-bg rounded" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 shimmer-bg rounded" />
              <div className="h-3 w-20 shimmer-bg rounded" />
            </div>
            <div className="mt-3 h-7 w-28 shimmer-bg rounded" />
            <div className="mt-2 h-3 w-24 shimmer-bg rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
