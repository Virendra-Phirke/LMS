import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from "./jwt";
import type { SessionPayload, UserRole } from "@/types";

// ─── Cookie Names ─────────────────────────────────────────────────────────────

const ACCESS_COOKIE = "lms_access_token";
const REFRESH_COOKIE = "lms_refresh_token";

// ─── Create Session ───────────────────────────────────────────────────────────

/**
 * Creates a new session in the DB and sets HTTP-only cookies for
 * both access and refresh tokens.
 */
export async function createSession(
  userId: string,
  email: string,
  role: UserRole,
  userAgent?: string,
  ipAddress?: string
): Promise<void> {
  // Generate a unique session identifier
  const jwtId = crypto.randomUUID();

  const payload: SessionPayload = {
    sub: userId,
    email,
    role,
    jti: jwtId,
  };

  // Sign both tokens
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  // Store session in database
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000);
  await db.insert(sessions).values({
    userId,
    jwtId,
    device: userAgent || null,
    ipAddress: ipAddress || null,
    expiresAt,
  });

  // Set HTTP-only cookies
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

// ─── Get Session ──────────────────────────────────────────────────────────────

/**
 * Reads the access token from cookies and verifies it.
 * Returns the session payload or null if invalid/expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) return null;

  return await verifyAccessToken(accessToken);
}

// ─── Refresh Session ──────────────────────────────────────────────────────────

/**
 * Attempts to refresh the access token using the refresh token.
 * Returns the new session payload or null if the refresh token is invalid.
 */
export async function refreshSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) return null;

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) return null;

  // Verify the session still exists in DB (not invalidated)
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.jwtId, payload.jti))
    .limit(1);

  if (!session) return null;

  // Issue a new access token
  const newAccessToken = await signAccessToken(payload);

  cookieStore.set(ACCESS_COOKIE, newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  return payload;
}

// ─── Destroy Session ──────────────────────────────────────────────────────────

/**
 * Destroys the current session — deletes from DB and clears cookies.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload?.jti) {
      await db.delete(sessions).where(eq(sessions.jwtId, payload.jti));
    }
  }

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

// ─── Destroy All Sessions ─────────────────────────────────────────────────────

/**
 * Invalidates all sessions for a user (e.g., on password change).
 */
export async function destroyAllSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ─── Authorization Helpers ──────────────────────────────────────────────────

export async function requireAdmin(): Promise<string | null> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return "Unauthorized";
  return null;
}

export async function requireLibrarian(): Promise<string | null> {
  const session = await getSession();
  if (!session || (session.role !== "LIBRARIAN" && session.role !== "ADMIN")) {
    return "Unauthorized";
  }
  return null;
}

export async function requireStudent(): Promise<string | null> {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return "Unauthorized";
  return null;
}
