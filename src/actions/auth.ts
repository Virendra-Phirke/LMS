"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import argon2 from "@node-rs/argon2";

const JWT_SECRET = new TextEncoder().encode(process.env.CARD_SIGNING_SECRET || "default-secret");

// ─── Get Current User ─────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token")?.value;

  let dbUserId: string | null = null;

  if (adminToken) {
    try {
      const { payload } = await jwtVerify(adminToken, JWT_SECRET);
      if (payload.sub) {
        dbUserId = payload.sub;
      }
    } catch (e) {
      // Invalid or expired token
    }
  }

  if (dbUserId) {
    const [user] = await db.select().from(users).where(eq(users.id, dbUserId)).limit(1);
    if (user) {
      const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)).limit(1);
      return {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: profile ? { fullName: profile.fullName, phone: profile.phone, avatar: profile.avatar } : null,
      };
    }
  }

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

// ─── Admin Login ──────────────────────────────────────────────────────────────

export async function loginAdmin(email: string, pass: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || user.role !== "ADMIN" || !user.passwordHash) {
    return { success: false, error: "Invalid admin credentials." };
  }

  const isValid = await argon2.verify(user.passwordHash, pass);
  if (!isValid) {
    return { success: false, error: "Invalid admin credentials." };
  }

  const token = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  cookies().set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true };
}
