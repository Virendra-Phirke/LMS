"use client";

import { useActionState, useEffect } from "react";
import { registerStudent } from "@/actions/users";
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

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    registerStudent,
    null
  );

  useEffect(() => {
    if (state?.success && state.data?.userId) {
      toast.success(state.message);
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
          <CardTitle className="text-2xl font-bold">Student Registration</CardTitle>
          <CardDescription>
            Create an account to borrow books and manage reservations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.success === false && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="e.g. STU-001"
                  required
                  className="h-10 bg-background/50"
                />
                {state?.errors?.studentId && (
                  <p className="text-xs text-destructive">
                    {state.errors.studentId[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  required
                  className="h-10 bg-background/50"
                />
                {state?.errors?.fullName && (
                  <p className="text-xs text-destructive">
                    {state.errors.fullName[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter university email"
                required
                className="h-10 bg-background/50"
              />
              {state?.errors?.email && (
                <p className="text-xs text-destructive mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g. Computer Science"
                  className="h-10 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <Input
                  id="course"
                  name="course"
                  placeholder="e.g. B.Tech"
                  className="h-10 bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                className="h-10 bg-background/50"
              />
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
