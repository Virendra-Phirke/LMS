"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  destroyAllSessions,
  getSession,
} from "@/lib/auth/session";
import { cache } from "react";
import { createEmailOTP, verifyEmailOTP, canResendOTP } from "@/lib/auth/otp";
import {
  loginSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  newPasswordSchema,
} from "@/lib/validations/auth";
import {
  sendVerificationOTP,
  sendPasswordResetOTP,
} from "@/lib/email/send";
import type { ActionResult } from "@/types";

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate input
  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validated.data;

  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || !user.passwordHash) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  // Verify password
  const isValid = await verifyPassword(user.passwordHash, password);
  if (!isValid) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  // Check account status
  if (user.status === "SUSPENDED") {
    return {
      success: false,
      message: "Your account has been suspended. Please contact an administrator.",
    };
  }

  if (user.status === "DEACTIVATED") {
    return {
      success: false,
      message: "Your account has been deactivated.",
    };
  }

  // Check email verification
  if (!user.emailVerified) {
    // Generate and send OTP
    const otp = await createEmailOTP(user.id, "EMAIL_VERIFICATION");
    
    console.log("-----------------------------------------");
    console.log(`[DEV ONLY] Email Verification OTP for ${email}: ${otp}`);
    console.log("-----------------------------------------");
    
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    try {
      await sendVerificationOTP(
        user.email,
        otp,
        profile?.fullName || "User"
      );
    } catch {
      // Log but don't block - OTP is saved in DB
    }

    return {
      success: false,
      message: "Please verify your email first",
      data: { 
        requiresVerification: true, 
        userId: user.id,
        devOtp: process.env.NODE_ENV === "development" ? otp : undefined
      },
    };
  }

  // Create session
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") || undefined;
  const forwarded = headerStore.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() || undefined;

  await createSession(user.id, user.email, user.role, userAgent, ipAddress);

  // Redirect based on role
  const dashboardRoutes: Record<string, string> = {
    ADMIN: "/admin",
    LIBRARIAN: "/librarian",
    STUDENT: "/student",
  };

  redirect(dashboardRoutes[user.role] || "/login");
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmail(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = formData.get("userId") as string;
  const otpCode = formData.get("otpCode") as string;

  const validated = verifyOTPSchema.safeParse({ otpCode });
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid OTP format",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  if (!userId) {
    return { success: false, message: "User not found" };
  }

  const isValid = await verifyEmailOTP(userId, otpCode, "EMAIL_VERIFICATION");
  if (!isValid) {
    return {
      success: false,
      message: "Invalid or expired OTP. Please try again.",
    };
  }

  // Mark email as verified
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, userId));

  // Check if user already has a password (existing account re-verification)
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.passwordHash) {
    // Account already has password, activate and redirect to login
    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Email verified successfully! You can now log in.",
      data: { redirect: "/login" },
    };
  }

  return {
    success: true,
    message: "Email verified! Please set your password.",
    data: { redirect: "/set-password", userId },
  };
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export async function resendOTP(
  userId: string,
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
): Promise<ActionResult> {
  if (!userId) {
    return { success: false, message: "User not found" };
  }

  // Check cooldown
  const canResend = await canResendOTP(userId);
  if (!canResend) {
    return {
      success: false,
      message: "Please wait 60 seconds before requesting a new code",
    };
  }

  // Get user info
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const name = profile?.fullName || "User";

  // Generate new OTP
  const otp = await createEmailOTP(userId, type);

  console.log("-----------------------------------------");
  console.log(`[DEV ONLY] Resend OTP for ${user.email}: ${otp}`);
  console.log("-----------------------------------------");

  // Send email
  try {
    if (type === "EMAIL_VERIFICATION") {
      await sendVerificationOTP(user.email, otp, name);
    } else {
      await sendPasswordResetOTP(user.email, otp, name);
    }
  } catch {
    return {
      success: false,
      message: "Failed to send verification email. Please try again.",
    };
  }

  return {
    success: true,
    message: "A new verification code has been sent to your email",
    data: {
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined
    }
  };
}

// ─── Set Password (New Account) ───────────────────────────────────────────────

export async function setPassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = formData.get("userId") as string;
  const rawData = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = newPasswordSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid password",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  if (!userId) {
    return { success: false, message: "User not found" };
  }

  // Hash and store password
  const passwordHash = await hashPassword(validated.data.password);

  await db
    .update(users)
    .set({
      passwordHash,
      status: "ACTIVE",
    })
    .where(eq(users.id, userId));

  return {
    success: true,
    message: "Password set successfully! You can now log in.",
    data: { redirect: "/login" },
  };
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export async function forgotPassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawData = {
    email: formData.get("email") as string,
  };

  const validated = forgotPasswordSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email } = validated.data;

  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  // Always return success to prevent email enumeration
  if (!user) {
    return {
      success: true,
      message: "If an account exists with this email, a reset code has been sent.",
    };
  }

  // Generate OTP
  const otp = await createEmailOTP(user.id, "PASSWORD_RESET");
  console.log("-----------------------------------------");
  console.log(`[DEV ONLY] Password Reset OTP for ${email}: ${otp}`);
  console.log("-----------------------------------------");

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  // Send email
  try {
    await sendPasswordResetOTP(user.email, otp, profile?.fullName || "User");
  } catch {
    // Don't reveal if email exists
  }

  return {
    success: true,
    message: "If an account exists with this email, a reset code has been sent.",
    data: { 
      userId: user.id,
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined
    },
  };
}

// ─── Reset Password ──────────────────────────────────────────────────────────

export async function resetPassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const userId = formData.get("userId") as string;
  const otpCode = formData.get("otpCode") as string;
  const rawData = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  if (!userId) {
    return { success: false, message: "User not found" };
  }

  // Verify OTP
  const isValidOTP = await verifyEmailOTP(userId, otpCode, "PASSWORD_RESET");
  if (!isValidOTP) {
    return {
      success: false,
      message: "Invalid or expired reset code",
    };
  }

  // Validate password
  const validated = newPasswordSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid password",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Hash and update password
  const passwordHash = await hashPassword(validated.data.password);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));

  // Invalidate all existing sessions
  await destroyAllSessions(userId);

  return {
    success: true,
    message: "Password reset successfully! Please log in with your new password.",
    data: { redirect: "/login" },
  };
}

// ─── Get Current User ─────────────────────────────────────────────────────────

export const getCurrentUser = cache(async () => {
  const headerStore = await headers();
  const userId = headerStore.get("x-user-id");
  if (!userId) {
    // Fallback if accessed outside middleware context (e.g. server action)
    const session = await getSession();
    if (!session) return null;
    return fetchUserFromDb(session.sub);
  }
  return fetchUserFromDb(userId);
});

async function fetchUserFromDb(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    profile: profile
      ? {
          fullName: profile.fullName,
          phone: profile.phone,
          avatar: profile.avatar,
        }
      : null,
  };
}
