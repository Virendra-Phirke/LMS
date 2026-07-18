"use client";

import { useActionState, useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail, resendOTP } from "@/actions/auth";
import { Button } from "@/components/ui/button";
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
import type { ActionResult } from "@/types";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId") || "";
  const [otpValue, setOtpValue] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    verifyEmail,
    null
  );

  // Handle success redirect
  useEffect(() => {
    if (state?.success && state.data?.redirect) {
      toast.success(state.message);
      const redirect = state.data.redirect as string;
      if (state.data.userId) {
        router.push(`${redirect}?userId=${state.data.userId}`);
      } else {
        router.push(redirect);
      }
    }
  }, [state, router]);

  // Handle devOtp auto-fill
  const devOtp = searchParams.get("devOtp");
  useEffect(() => {
    if (devOtp && !otpValue) {
      setTimeout(() => setOtpValue(devOtp), 0);
      toast.info("OTP auto-filled for development mode");
    }
  }, [devOtp, otpValue]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    const result = await resendOTP(userId, "EMAIL_VERIFICATION");
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

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-2">
            <span className="text-2xl">✉️</span>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit code to your email address.
            <br />
            Enter it below to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="otpCode" value={otpValue} />

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
              type="submit"
              className="w-full h-11 font-semibold cursor-pointer"
              disabled={isPending || otpValue.length !== 6}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
