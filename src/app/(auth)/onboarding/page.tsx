"use client";

import { useActionState, useEffect } from "react";
import { completeOnboarding } from "@/actions/users";
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
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/types";
import { Loader2, GraduationCap } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    completeOnboarding,
    null
  );

  useEffect(() => {
    if (state?.success && state.data?.redirect) {
      router.push(state.data.redirect as string);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-grain opacity-5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-chart-5/5 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-500">
        <Card className="glass-card">
          <CardHeader className="space-y-2 pb-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4 shadow-sm">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-base">
              One more step! Fill in your student details to access the library.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              {state?.success === false && (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 animate-in fade-in slide-in-from-top-2">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    placeholder="e.g. STU-001"
                    required
                    className="h-12 bg-background/50 focus:bg-background transition-colors"
                  />
                  {state?.errors?.studentId && (
                    <p className="text-xs text-destructive animate-in fade-in">
                      {state.errors.studentId[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter full name"
                    required
                    className="h-12 bg-background/50 focus:bg-background transition-colors"
                  />
                  {state?.errors?.fullName && (
                    <p className="text-xs text-destructive animate-in fade-in">
                      {state.errors.fullName[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Input
                    id="department"
                    name="department"
                    placeholder="e.g. Computer Science"
                    className="h-12 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="course">Course (Optional)</Label>
                  <Input
                    id="course"
                    name="course"
                    placeholder="e.g. B.Tech"
                    className="h-12 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  className="h-12 bg-background/50 focus:bg-background transition-colors"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold active-press mt-2"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Setting up...
                  </span>
                ) : (
                  "Complete Setup & Go to Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
