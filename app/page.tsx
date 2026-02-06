import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 via-white to-amber-50/30">
      <div className="max-w-2xl text-center animate-fade-in">
        <div className="relative mx-auto w-fit">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 opacity-15 blur-xl" />
          <Image
            src="/company-logo.jpg"
            alt="ProTech Roofing"
            width={180}
            height={180}
            className="relative mx-auto rounded-2xl shadow-elevated"
            priority
          />
        </div>
        <h1 className="mt-8 font-display text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-7xl">
          <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            ProTech
          </span>{" "}
          Roofing
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Professional roof estimation tool. Get instant measurements and
          pricing estimates powered by Google&apos;s Solar API.
        </p>
        <div
          className="mt-8 flex items-center justify-center gap-4"
          style={{ animationDelay: "0.1s" }}
        >
          <Link
            href="/sign-in"
            className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-neutral-800 shadow-card ring-1 ring-neutral-200 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
