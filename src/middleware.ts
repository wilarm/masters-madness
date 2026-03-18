import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require the user to be signed in
const isAuthRequired = createRouteMatcher([
  "/picks(.*)",
  "/pool/(.*)/commissioner(.*)",
]);

// Routes that require platform admin access (admin.mastersmadness.com or /admin/*)
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId: clerkUserId } = await auth();
  // In development with production Clerk keys, fall back to DEV_USER_ID for local testing
  const userId =
    clerkUserId ??
    (process.env.NODE_ENV === "development" ? process.env.DEV_USER_ID ?? null : null);
  const url = request.nextUrl;

  // --- Admin subdomain routing ---
  // When deployed: admin.mastersmadness.com/* → /admin/*
  // In dev: handled via /admin/* path directly
  const hostname = request.headers.get("host") ?? "";
  const isAdminSubdomain =
    hostname.startsWith("admin.") && !hostname.startsWith("localhost");

  if (isAdminSubdomain || isAdminRoute(request)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", url);
      signInUrl.searchParams.set("redirect_url", url.pathname);
      return NextResponse.redirect(signInUrl);
    }
    const adminIds = (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!adminIds.includes(userId)) {
      // Not a platform admin — redirect to home silently
      return NextResponse.redirect(new URL("/", url));
    }
    // On admin subdomain, rewrite to /admin/* in the app
    if (isAdminSubdomain && !url.pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL(`/admin${url.pathname}`, url));
    }
  }

  // --- Auth-required routes ---
  if (isAuthRequired(request) && !userId) {
    const signInUrl = new URL("/sign-in", url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
