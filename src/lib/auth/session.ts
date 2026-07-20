import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── Clerk-based Auth Helpers ─────────────────────────────────────────────────

/**
 * Gets the current session data from Clerk.
 * Returns a session-like object for backward compatibility with pages.
 */
export async function getSession() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Look up DB user by Clerk ID to get the internal UUID
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  return {
    sub: user?.id || userId, // Internal UUID or Clerk ID as fallback
    role: role || "STUDENT",
    email: (sessionClaims as { email?: string })?.email || "",
    jti: "",
  };
}

/**
 * Authorization helper: requires ADMIN role
 */
export async function requireAdmin(): Promise<string | null> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "ADMIN") return "Unauthorized";
  return null;
}

/**
 * Authorization helper: requires LIBRARIAN or ADMIN role
 */
export async function requireLibrarian(): Promise<string | null> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "LIBRARIAN" && role !== "ADMIN") return "Unauthorized";
  return null;
}

/**
 * Authorization helper: requires STUDENT role
 */
export async function requireStudent(): Promise<string | null> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "STUDENT") return "Unauthorized";
  return null;
}
