"use client";

import { useActionState, useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword, resendOTP } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Link from "next/link";
import type { ActionResult } from "@/types";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId") || "";
  const [otpValue, setOtpValue] = useState("");
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [cooldown, setCooldown] = useState(0);

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    resetPassword,
    null
  );

  useEffect(() => {
    if (state?.success && state.data?.redirect) {
      toast.success(state.message);
      router.push(state.data.redirect as string);
    }
  }, [state, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    const result = await resendOTP(userId, "PASSWORD_RESET");
    if (result.success) {
      toast.success(result.message);
      setCooldown(60);
      if (result.data?.devOtp) {
        setOtpValue(result.data.devOtp as string);
        toast.info("OTP auto-filled for development mode");
      }
    } else {
      toast.error(result.message);
    }
  }, [userId]);

  // Handle devOtp auto-fill
  const devOtp = searchParams.get("devOtp");
  useEffect(() => {
    if (devOtp && !otpValue) {
      setTimeout(() => setOtpValue(devOtp), 0);
      toast.info("OTP auto-filled for development mode");
    }
  }, [devOtp, otpValue]);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-2">
            <span className="text-2xl">🔄</span>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            {step === "otp"
              ? "Enter the 6-digit code sent to your email"
              : "Create your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "otp" ? (
            <div className="space-y-6">
              {state?.success === false && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={(value) => setOtpValue(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-lg" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="button"
                className="w-full h-11 font-semibold cursor-pointer"
                disabled={otpValue.length !== 6}
                onClick={() => setStep("password")}
              >
                Continue
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn&apos;t receive the code?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="text-primary hover:text-primary/80 cursor-pointer"
                >
                  {cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend Code"}
                </Button>
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="otpCode" value={otpValue} />

              {state?.success === false && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
                  required
                  className="h-11 bg-background/50"
                />
                {state?.errors?.password && (
                  <p className="text-xs text-destructive">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  className="h-11 bg-background/50"
                />
                {state?.errors?.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {state.errors.confirmPassword[0]}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 cursor-pointer"
                  onClick={() => setStep("otp")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 font-semibold cursor-pointer"
                  disabled={isPending}
                >
                  {isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
