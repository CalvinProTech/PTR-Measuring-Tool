import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-gray-600">Page not found</p>
      <Link
        href="/dashboard"
        className="mt-4 text-primary-600 hover:text-primary-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
