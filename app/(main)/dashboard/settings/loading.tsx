export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-10 w-full rounded bg-gray-200" />
            <div className="h-10 w-full rounded bg-gray-200" />
            <div className="h-10 w-full rounded bg-gray-200" />
            <div className="h-10 w-1/3 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
