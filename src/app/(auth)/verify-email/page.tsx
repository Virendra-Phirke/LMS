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
import { Loader2, MailCheck, RefreshCw } from "lucide-react";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId") || "";
  const [otpValue, setOtpValue] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

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
    setIsResending(true);
    const result = await resendOTP(userId, "EMAIL_VERIFICATION");
    setIsResending(false);
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
      <Card className="glass-card">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4 shadow-sm">
            <MailCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-base">
            We&apos;ve sent a 6-digit code to your email address.
            <br />
            Enter it below to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-8">
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="otpCode" value={otpValue} />

            {state?.success === false && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 animate-in fade-in slide-in-from-top-2">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(value) => setOtpValue(value)}
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-12 h-14 text-xl rounded-md border-border/50 bg-background/50 focus:bg-background transition-colors"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold active-press"
              disabled={isPending || otpValue.length !== 6}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="text-center space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="hover-scale font-medium border-primary/20 hover:bg-primary/5"
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className={`w-4 h-4 mr-2 ${cooldown > 0 ? "opacity-50" : ""}`} />
                )}
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading verification...</p>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
