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
import { Loader2, KeyRound } from "lucide-react";

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
      <Card className="glass-card">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4 shadow-sm">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Forgot Password</CardTitle>
          <CardDescription className="text-base">
            Enter your email and we&apos;ll send you a reset code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {state?.success === true && !state.data?.userId && (
              <Alert className="border-primary/30 bg-primary/10 animate-in fade-in slide-in-from-top-2">
                <AlertDescription className="text-primary">
                  {state.message}
                </AlertDescription>
              </Alert>
            )}

            {state?.success === false && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 animate-in fade-in slide-in-from-top-2">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="h-12 bg-background/50 focus:bg-background transition-colors"
              />
              {state?.errors?.email && (
                <p className="text-xs text-destructive mt-1 animate-in fade-in">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold active-press mt-2"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending code...
                </span>
              ) : (
                "Send Reset Code"
              )}
            </Button>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                &larr; Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
