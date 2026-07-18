import { db } from "@/db";
import { emailOtps } from "@/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import type { OTPType } from "@/types";

// ─── OTP Configuration ───────────────────────────────────────────────────────

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

// ─── Generate OTP ─────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random 6-digit OTP code.
 */
export function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

// ─── Create Email OTP ─────────────────────────────────────────────────────────

/**
 * Generates and stores an OTP for a user.
 * Invalidates any existing unused OTPs of the same type for this user.
 */
export async function createEmailOTP(
  userId: string,
  type: OTPType
): Promise<string> {
  // Invalidate existing unused OTPs of this type
  const existingOtps = await db
    .select({ id: emailOtps.id })
    .from(emailOtps)
    .where(
      and(
        eq(emailOtps.userId, userId),
        eq(emailOtps.type, type),
        eq(emailOtps.used, false)
      )
    );

  for (const otp of existingOtps) {
    await db
      .update(emailOtps)
      .set({ used: true })
      .where(eq(emailOtps.id, otp.id));
  }

  // Generate new OTP
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(emailOtps).values({
    userId,
    otpCode,
    type,
    expiresAt,
  });

  return otpCode;
}

// ─── Verify Email OTP ─────────────────────────────────────────────────────────

/**
 * Validates an OTP code. Returns true if valid, marks it as used.
 */
export async function verifyEmailOTP(
  userId: string,
  otpCode: string,
  type: OTPType
): Promise<boolean> {
  const now = new Date();

  const [otp] = await db
    .select()
    .from(emailOtps)
    .where(
      and(
        eq(emailOtps.userId, userId),
        eq(emailOtps.otpCode, otpCode),
        eq(emailOtps.type, type),
        eq(emailOtps.used, false),
        gt(emailOtps.expiresAt, now)
      )
    )
    .orderBy(desc(emailOtps.createdAt))
    .limit(1);

  if (!otp) return false;

  // Mark OTP as used
  await db
    .update(emailOtps)
    .set({ used: true })
    .where(eq(emailOtps.id, otp.id));

  return true;
}

// ─── Can Resend OTP ───────────────────────────────────────────────────────────

/**
 * Checks if the 60-second cooldown has elapsed since the last OTP was sent.
 */
export async function canResendOTP(userId: string): Promise<boolean> {
  const cooldownTime = new Date(
    Date.now() - OTP_RESEND_COOLDOWN_SECONDS * 1000
  );

  const [recentOtp] = await db
    .select()
    .from(emailOtps)
    .where(
      and(
        eq(emailOtps.userId, userId),
        gt(emailOtps.createdAt, cooldownTime)
      )
    )
    .orderBy(desc(emailOtps.createdAt))
    .limit(1);

  return !recentOtp;
}
