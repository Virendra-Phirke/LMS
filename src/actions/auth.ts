"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * Gets the current authenticated user from Clerk and fetches their
 * LMS profile from the database. Returns null if not authenticated
 * or if no DB record exists.
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Look up DB user by Clerk ID
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!user) return null;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    role: user.role,
    status: user.status,
    profile: profile
      ? {
          fullName: profile.fullName,
          phone: profile.phone,
          avatar: profile.avatar,
        }
      : null,
  };
}
