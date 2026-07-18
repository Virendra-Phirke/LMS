import { resend, EMAIL_FROM } from "./index";
import { VerificationOTPEmail } from "./templates/verification-otp";
import { PasswordResetOTPEmail } from "./templates/password-reset-otp";
import { AccountCreatedEmail } from "./templates/account-created";

// ─── Send Verification OTP ───────────────────────────────────────────────────

export async function sendVerificationOTP(
  email: string,
  otp: string,
  name: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: "Verify Your Email — Library Management System",
    react: <VerificationOTPEmail name={name} otp={otp} />,
  });

  if (error) {
    console.error("Failed to send verification OTP:", error);
    throw new Error("Failed to send verification email");
  }
}

// ─── Send Password Reset OTP ─────────────────────────────────────────────────

export async function sendPasswordResetOTP(
  email: string,
  otp: string,
  name: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: "Password Reset Code — Library Management System",
    react: <PasswordResetOTPEmail name={name} otp={otp} />,
  });

  if (error) {
    console.error("Failed to send password reset OTP:", error);
    throw new Error("Failed to send password reset email");
  }
}

// ─── Send Account Created Notification ────────────────────────────────────────

export async function sendAccountCreatedNotification(
  email: string,
  name: string,
  role: string
): Promise<void> {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: "Your Library Account Has Been Created",
    react: <AccountCreatedEmail name={name} role={role} loginUrl={loginUrl} />,
  });

  if (error) {
    console.error("Failed to send account created notification:", error);
    throw new Error("Failed to send account creation email");
  }
}
