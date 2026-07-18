"use client";

import { useActionState, useEffect } from "react";
import { login } from "@/actions/auth";
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
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    login,
    null
  );

  useEffect(() => {
    if (state?.success === false && state.data?.requiresVerification) {
      toast.info("Please verify your email to continue");
      let url = `/verify-email?userId=${state.data.userId}`;
      if (state.data.devOtp) {
        url += `&devOtp=${state.data.devOtp}`;
      }
      router.push(url);
    }
  }, [state, router]);

  return (
    <div className="space-y-6">
      {/* Mobile branding */}
      <div className="lg:hidden flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-xl">📚</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Library</span>
          <span className="text-muted-foreground font-light">MS</span>
        </h1>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.success === false &&
              !state.data?.requiresVerification && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

            <div className="space-y-2">
              <Label htmlFor="email">Email or ID</Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="Enter your email or ID"
                autoComplete="username"
                required
                className="h-11 bg-background/50"
              />
              {state?.errors?.email && (
                <p className="text-xs text-destructive mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="h-11 bg-background/50"
              />
              {state?.errors?.password && (
                <p className="text-xs text-destructive mt-1">
                  {state.errors.password[0]}
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Librarian accounts are created by administrators.</p>
        <p>
          Students can{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            register here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
