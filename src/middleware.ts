import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, verifyRefreshToken, signAccessToken, ACCESS_TOKEN_MAX_AGE } from "@/lib/auth/jwt";

// ─── Route Definitions ───────────────────────────────────────────────────────

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/set-password",
];

// Shared routes accessible to all authenticated users
const SHARED_ROUTES = ["/settings", "/profile"];

const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/admin", ...SHARED_ROUTES],
  LIBRARIAN: ["/librarian", "/books", "/borrow", "/returns", ...SHARED_ROUTES],
  STUDENT: ["/student", "/reservations", ...SHARED_ROUTES],
};

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/admin",
  LIBRARIAN: "/librarian",
  STUDENT: "/student",
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Get tokens from cookies
  const accessToken = request.cookies.get("lms_access_token")?.value;
  const refreshToken = request.cookies.get("lms_refresh_token")?.value;

  // Try to verify access token
  let session = accessToken ? await verifyAccessToken(accessToken) : null;

  // If access token expired, try refresh
  let response = NextResponse.next();
  if (!session && refreshToken) {
    try {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload && refreshPayload.role && ROLE_DASHBOARDS[refreshPayload.role]) {
        // Issue new access token
        const newAccessToken = await signAccessToken(refreshPayload);
        response = NextResponse.next();
        response.cookies.set("lms_access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: ACCESS_TOKEN_MAX_AGE,
        });
        session = refreshPayload;
      } else {
        // Invalid payload — clear stale cookies to prevent redirect loops
        response = NextResponse.next();
        response.cookies.delete("lms_access_token");
        response.cookies.delete("lms_refresh_token");
      }
    } catch {
      // Token verification failed — clear stale cookies
      response = NextResponse.next();
      response.cookies.delete("lms_access_token");
      response.cookies.delete("lms_refresh_token");
    }
  }

  // Root redirect
  if (pathname === "/") {
    if (session && ROLE_DASHBOARDS[session.role]) {
      return NextResponse.redirect(
        new URL(ROLE_DASHBOARDS[session.role], request.url)
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Public routes — redirect authenticated users to dashboard
  if (isPublicRoute) {
    if (session && ROLE_DASHBOARDS[session.role]) {
      return NextResponse.redirect(
        new URL(ROLE_DASHBOARDS[session.role], request.url)
      );
    }
    // Not authenticated or unknown role — allow access to public route
    return response;
  }

  // Protected routes — require authentication
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const userRole = session.role;
  const allowedRoutes = ROLE_ROUTES[userRole] || [];

  const hasAccess = allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!hasAccess) {
    // Redirect to role-appropriate dashboard (never fall back to /login to avoid loops)
    const dashboard = ROLE_DASHBOARDS[userRole];
    if (dashboard) {
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    // Unknown role — clear session and send to login
    const clearResponse = NextResponse.redirect(new URL("/login", request.url));
    clearResponse.cookies.delete("lms_access_token");
    clearResponse.cookies.delete("lms_refresh_token");
    return clearResponse;
  }

  // Inject user info into request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.sub);
  requestHeaders.set("x-user-role", session.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// ─── Middleware Config ────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
