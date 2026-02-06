import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50">
      <h1 className="font-display text-8xl font-extrabold bg-gradient-to-b from-neutral-200 to-neutral-400 bg-clip-text text-transparent">
        404
      </h1>
      <p className="mt-3 text-lg text-neutral-500">Page not found</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-600/30"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
