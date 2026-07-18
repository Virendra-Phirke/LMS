import { z } from "zod";

// ─── Login Schema ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email or ID is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Verify OTP Schema ───────────────────────────────────────────────────────

export const verifyOTPSchema = z.object({
  otpCode: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;

// ─── Reset Password Schema (email step) ──────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ─── New Password Schema ──────────────────────────────────────────────────────

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
