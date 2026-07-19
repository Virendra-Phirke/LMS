"use client";

import { useActionState, useEffect } from "react";
import { createStudent } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import type { ActionResult } from "@/types";

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createStudent,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setTimeout(() => setOpen(false), 0);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer gap-2"
      >
        <UserPlus className="w-4 h-4" /> Add Student
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg glass-card border-border/50">
        <DialogHeader>
          <DialogTitle>Create Student Account</DialogTitle>
          <DialogDescription>
            A verification email will be sent to the student to activate their
            account.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.success === false && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stu-studentId">Student ID</Label>
              <Input
                id="stu-studentId"
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
              <Label htmlFor="stu-fullName">Full Name</Label>
              <Input
                id="stu-fullName"
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
            <Label htmlFor="stu-email">Email</Label>
            <Input
              id="stu-email"
              name="email"
              type="email"
              placeholder="Enter email address"
              required
              className="h-10 bg-background/50"
            />
            {state?.errors?.email && (
              <p className="text-xs text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stu-department">Department</Label>
              <Input
                id="stu-department"
                name="department"
                placeholder="e.g. Computer Science"
                className="h-10 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stu-course">Course</Label>
              <Input
                id="stu-course"
                name="course"
                placeholder="e.g. B.Tech"
                className="h-10 bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stu-phone">Phone (Optional)</Label>
            <Input
              id="stu-phone"
              name="phone"
              placeholder="Enter phone number"
              className="h-10 bg-background/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
