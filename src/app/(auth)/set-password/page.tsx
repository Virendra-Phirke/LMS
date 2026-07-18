"use client";

import { useActionState, useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { setPassword } from "@/actions/auth";
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
import type { ActionResult } from "@/types";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId") || "";
  const [password, setPasswordValue] = useState("");

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    setPassword,
    null
  );

  const strength = useMemo(() => {
    return PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  }, [password]);

  const strengthColor = useMemo(() => {
    if (strength <= 1) return "bg-destructive";
    if (strength <= 2) return "bg-orange-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-emerald-500";
  }, [strength]);

  useEffect(() => {
    if (state?.success && state.data?.redirect) {
      toast.success(state.message);
      router.push(state.data.redirect as string);
    }
  }, [state, router]);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-2">
            <span className="text-2xl">🔐</span>
          </div>
          <CardTitle className="text-2xl font-bold">Set Your Password</CardTitle>
          <CardDescription>
            Create a strong password to secure your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="userId" value={userId} />

            {state?.success === false && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                className="h-11 bg-background/50"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
              {state?.errors?.password && (
                <p className="text-xs text-destructive">
                  {state.errors.password[0]}
                </p>
              )}

              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength ? strengthColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {PASSWORD_RULES.map((rule) => (
                      <div
                        key={rule.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className={
                            rule.test(password)
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                          }
                        >
                          {rule.test(password) ? "✓" : "○"}
                        </span>
                        <span
                          className={
                            rule.test(password)
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                          }
                        >
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                className="h-11 bg-background/50"
              />
              {state?.errors?.confirmPassword && (
                <p className="text-xs text-destructive">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold cursor-pointer"
              disabled={isPending || strength < 4}
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
                  Setting password...
                </span>
              ) : (
                "Set Password & Activate Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
