import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          ProTech Roofing
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Professional roof estimation tool. Get instant measurements and
          pricing estimates powered by Google&apos;s Solar API.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/sign-in"
            className="rounded-md bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
