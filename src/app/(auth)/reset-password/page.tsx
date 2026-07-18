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
import { Loader2, RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId") || "";
  const [otpValue, setOtpValue] = useState("");
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setIsResending(true);
    const result = await resendOTP(userId, "PASSWORD_RESET");
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
      <Card className="glass-card">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4 shadow-sm">
            {step === "otp" ? (
              <RefreshCw className="w-8 h-8 text-primary" />
            ) : (
              <KeyRound className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-base">
            {step === "otp"
              ? "Enter the 6-digit code sent to your email"
              : "Create your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "otp" ? (
            <div className="space-y-8">
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
                type="button"
                className="w-full h-12 text-base font-semibold active-press"
                disabled={otpValue.length !== 6}
                onClick={() => setStep("password")}
              >
                Continue
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
            </div>
          ) : (
            <form action={formAction} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="otpCode" value={otpValue} />

              {state?.success === false && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 animate-in fade-in slide-in-from-top-2">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    className="h-12 bg-background/50 focus:bg-background transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {state?.errors?.password && (
                  <p className="text-xs text-destructive animate-in fade-in">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    required
                    className="h-12 bg-background/50 focus:bg-background transition-colors pr-10"
                  />
                </div>
                {state?.errors?.confirmPassword && (
                  <p className="text-xs text-destructive animate-in fade-in">
                    {state.errors.confirmPassword[0]}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep("otp")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 font-semibold active-press"
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting...
                    </span>
                  ) : "Reset Password"}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
            >
              &larr; Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
