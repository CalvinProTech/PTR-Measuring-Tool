export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="mt-4 h-24 w-full rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
