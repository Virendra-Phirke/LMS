import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@/types";

// ─── JWT Configuration ────────────────────────────────────────────────────────

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes in seconds
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ─── Sign Tokens ──────────────────────────────────────────────────────────────

/**
 * Sign an access token (short-lived, 15 min).
 */
export async function signAccessToken(
  payload: SessionPayload
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_SECRET);
}

/**
 * Sign a refresh token (long-lived, 7 days).
 */
export async function signRefreshToken(
  payload: SessionPayload
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(REFRESH_SECRET);
}

// ─── Verify Tokens ────────────────────────────────────────────────────────────

/**
 * Verify and decode an access token.
 */
export async function verifyAccessToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Verify and decode a refresh token.
 */
export async function verifyRefreshToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
