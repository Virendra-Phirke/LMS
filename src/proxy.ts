import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ─── Route Definitions ───────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/register(.*)",
  "/sso-callback(.*)",
  "/api/webhooks(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/admin",
  LIBRARIAN: "/librarian",
  STUDENT: "/student",
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Public routes — redirect authenticated users to their dashboard
  if (isPublicRoute(request)) {
    if (userId && role && ROLE_DASHBOARDS[role]) {
      return NextResponse.redirect(
        new URL(ROLE_DASHBOARDS[role], request.url)
      );
    }
    // Authenticated but no role → send to onboarding
    if (userId && !role) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.next();
  }

  // All non-public routes require authentication
  if (!userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Onboarding route — only allow users without a role
  if (isOnboardingRoute(request)) {
    if (role && ROLE_DASHBOARDS[role]) {
      return NextResponse.redirect(
        new URL(ROLE_DASHBOARDS[role], request.url)
      );
    }
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === "/") {
    if (role && ROLE_DASHBOARDS[role]) {
      return NextResponse.redirect(
        new URL(ROLE_DASHBOARDS[role], request.url)
      );
    }
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // If user has no role, they need onboarding
  if (!role) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Role-based access control
  const ROLE_ROUTES: Record<string, string[]> = {
    ADMIN: ["/admin", "/settings", "/profile"],
    LIBRARIAN: ["/librarian", "/books", "/borrow", "/returns", "/settings", "/profile"],
    STUDENT: ["/student", "/reservations", "/settings", "/profile"],
  };

  const allowedRoutes = ROLE_ROUTES[role] || [];
  const hasAccess = allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!hasAccess) {
    const dashboard = ROLE_DASHBOARDS[role];
    if (dashboard) {
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

// ─── Middleware Config ────────────────────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
