export default function UsersLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-44 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 w-12 rounded bg-gray-200" />
              <div className="h-4 w-12 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200 ml-auto" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="ml-4 flex-1">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-48 rounded bg-gray-200" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
