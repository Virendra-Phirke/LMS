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
import { Loader2, ShieldCheck, CheckCircle2, Circle } from "lucide-react";

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
      <Card className="glass-card">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Set Your Password</CardTitle>
          <CardDescription className="text-base">
            Create a strong password to secure your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="userId" value={userId} />

            {state?.success === false && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 animate-in fade-in slide-in-from-top-2">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                className="h-12 bg-background/50 focus:bg-background transition-colors"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
              {state?.errors?.password && (
                <p className="text-xs text-destructive animate-in fade-in">
                  {state.errors.password[0]}
                </p>
              )}

              {/* Strength indicator */}
              {password.length > 0 && (
                <div className="space-y-3 pt-2 animate-in fade-in">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                          i <= strength ? strengthColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {PASSWORD_RULES.map((rule) => (
                      <div
                        key={rule.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        {rule.test(password) ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span
                          className={`transition-colors duration-300 ${
                            rule.test(password)
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                className="h-12 bg-background/50 focus:bg-background transition-colors"
              />
              {state?.errors?.confirmPassword && (
                <p className="text-xs text-destructive animate-in fade-in">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold active-press mt-2"
              disabled={isPending || strength < 4}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
