"use client";

import { useActionState, useEffect } from "react";
import { createLibrarian } from "@/actions/users";
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

export function CreateLibrarianDialog() {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createLibrarian,
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
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary/90 backdrop-blur-sm text-primary-foreground shadow hover:bg-primary h-9 px-4 py-2 cursor-pointer gap-2"
      >
        <UserPlus className="w-4 h-4" /> Add Librarian
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-card border-border/50">
        <DialogHeader>
          <DialogTitle>Create Librarian Account</DialogTitle>
          <DialogDescription>
            A verification email will be sent to the librarian to activate their
            account.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.success === false && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="lib-fullName">Full Name</Label>
            <Input
              id="lib-fullName"
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

          <div className="space-y-2">
            <Label htmlFor="lib-email">Email</Label>
            <Input
              id="lib-email"
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

          <div className="space-y-2">
            <Label htmlFor="lib-phone">Phone (Optional)</Label>
            <Input
              id="lib-phone"
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
