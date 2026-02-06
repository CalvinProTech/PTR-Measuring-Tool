export function NearbyPlacesSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="section-header">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 shimmer-bg rounded" />
          <div>
            <div className="h-5 w-36 shimmer-bg rounded" />
            <div className="mt-2 h-4 w-48 shimmer-bg rounded" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 shimmer-bg rounded-full" />
              <div className="h-4 w-4 shimmer-bg rounded" />
              <div className="h-3 w-24 shimmer-bg rounded" />
              <div className="ml-auto h-4 w-12 shimmer-bg rounded-full" />
            </div>
            <div className="w-full h-24 shimmer-bg rounded-lg mb-3" />
            <div className="h-5 w-32 shimmer-bg rounded" />
            <div className="mt-2 h-4 w-full shimmer-bg rounded" />
            <div className="mt-2 flex items-center gap-1">
              <div className="h-5 w-14 shimmer-bg rounded-full" />
              <div className="h-3 w-12 shimmer-bg rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
