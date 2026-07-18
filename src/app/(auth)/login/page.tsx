"use client";

import { useActionState, useEffect, useState } from "react";
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
import { Loader2, Eye, EyeOff, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="lg:hidden flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-sm">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-foreground">Library</span>
          <span className="text-primary font-light">MS</span>
        </h1>
      </div>

      <Card className="glass-card">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {state?.success === false &&
              !state.data?.requiresVerification && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 animate-in fade-in slide-in-from-top-2">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

            <div className="space-y-2.5">
              <Label htmlFor="email">Email or ID</Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="Enter your email or ID"
                autoComplete="username"
                required
                className="h-12 bg-background/50 focus:bg-background transition-colors"
              />
              {state?.errors?.email && (
                <p className="text-xs text-destructive mt-1 animate-in fade-in">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-12 bg-background/50 focus:bg-background transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {state?.errors?.password && (
                <p className="text-xs text-destructive mt-1 animate-in fade-in">
                  {state.errors.password[0]}
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground space-y-1.5">
        <p>Librarian accounts are created by administrators.</p>
        <p>
          Students can{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
          >
            register here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
