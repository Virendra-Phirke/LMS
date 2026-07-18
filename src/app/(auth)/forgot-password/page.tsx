"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/actions/auth";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Link from "next/link";
import type { ActionResult } from "@/types";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    forgotPassword,
    null
  );

  useEffect(() => {
    if (state?.success && state.data?.userId) {
      toast.success(state.message);
      let url = `/reset-password?userId=${state.data.userId}`;
      if (state.data.devOtp) {
        url += `&devOtp=${state.data.devOtp}`;
      }
      router.push(url);
    }
  }, [state, router]);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-2">
            <span className="text-2xl">🔑</span>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.success === true && !state.data?.userId && (
              <Alert className="border-primary/30 bg-primary/10">
                <AlertDescription className="text-primary">
                  {state.message}
                </AlertDescription>
              </Alert>
            )}

            {state?.success === false && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="h-11 bg-background/50"
              />
              {state?.errors?.email && (
                <p className="text-xs text-destructive mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold cursor-pointer"
              disabled={isPending}
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
                  Sending code...
                </span>
              ) : (
                "Send Reset Code"
              )}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
