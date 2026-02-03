export default function TrainingLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 rounded bg-gray-200" />
          </div>
          <div className="h-10 w-24 rounded bg-gray-200" />
        </div>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="mb-4 h-6 w-32 rounded bg-gray-200" />
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="space-y-4 p-4">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 w-48 rounded bg-gray-200" />
                        <div className="mt-2 h-3 w-32 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
