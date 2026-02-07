import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Completely bypass Clerk for embed routes
const isEmbedRoute = (request: NextRequest) => {
  return request.nextUrl.pathname.startsWith("/embed");
};

export default function middleware(request: NextRequest) {
  // For embed routes, skip Clerk entirely
  if (isEmbedRoute(request)) {
    return NextResponse.next();
  }

  // For all other routes, use Clerk middleware
  return clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })(request, {} as any);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
