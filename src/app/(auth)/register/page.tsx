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
import { Loader2, BookOpen } from "lucide-react";

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
          <CardTitle className="text-3xl font-bold tracking-tight">Student Registration</CardTitle>
          <CardDescription className="text-base">
            Create an account to borrow books and manage reservations
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

            <div className="space-y-2.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter university email"
                required
                className="h-12 bg-background/50 focus:bg-background transition-colors"
              />
              {state?.errors?.email && (
                <p className="text-xs text-destructive mt-1 animate-in fade-in">
                  {state.errors.email[0]}
                </p>
              )}
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
                className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
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
