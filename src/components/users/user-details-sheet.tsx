"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { suspendUser, activateUser, deactivateUser } from "@/actions/users";
import { toast } from "sonner";
import { useState } from "react";

interface UserDetailsSheetProps {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    emailVerified: boolean;
    createdAt: Date;
    fullName: string | null;
    phone: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/30",
  DEACTIVATED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  LIBRARIAN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  STUDENT: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export function UserDetailsSheet({
  user,
  open,
  onOpenChange,
}: UserDetailsSheetProps) {
  const [actionPending, setActionPending] = useState(false);

  if (!user) return null;

  const handleAction = async (
    action: (id: string) => Promise<{ success: boolean; message: string }>,
    userId: string
  ) => {
    setActionPending(true);
    try {
      const result = await action(userId);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionPending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>View and manage user account</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* User header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-xl font-semibold text-primary">
              {user.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {user.fullName || "Unknown"}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* Details grid */}
          <div className="space-y-4">
            <DetailRow label="Role">
              <Badge
                variant="outline"
                className={ROLE_STYLES[user.role] || ""}
              >
                {user.role}
              </Badge>
            </DetailRow>

            <DetailRow label="Status">
              <Badge
                variant="outline"
                className={STATUS_STYLES[user.status] || ""}
              >
                {user.status}
              </Badge>
            </DetailRow>

            <DetailRow label="Email Verified">
              <span
                className={
                  user.emailVerified ? "text-emerald-400" : "text-amber-400"
                }
              >
                {user.emailVerified ? "✓ Verified" : "✕ Not Verified"}
              </span>
            </DetailRow>

            <DetailRow label="Phone">
              <span>{user.phone || "—"}</span>
            </DetailRow>

            <DetailRow label="Created">
              <span>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </DetailRow>
          </div>

          <Separator />

          {/* Actions */}
          {user.role !== "ADMIN" && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {user.status !== "ACTIVE" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                    onClick={() => handleAction(activateUser, user.id)}
                    disabled={actionPending}
                  >
                    Activate
                  </Button>
                )}
                {user.status !== "SUSPENDED" && user.status !== "DEACTIVATED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                    onClick={() => handleAction(suspendUser, user.id)}
                    disabled={actionPending}
                  >
                    Suspend
                  </Button>
                )}
                {user.status !== "DEACTIVATED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10 cursor-pointer"
                    onClick={() => handleAction(deactivateUser, user.id)}
                    disabled={actionPending}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}
