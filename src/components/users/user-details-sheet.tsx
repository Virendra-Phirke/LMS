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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  suspendUser,
  activateUser,
  deactivateUser,
  deleteUser,
  getUserById,
} from "@/actions/users";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldOff,
  ShieldAlert,
  Trash2,
  Pencil,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Building2,
  BookOpen,
  IdCard,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { EditUserDialog } from "./edit-user-dialog";

interface UserDetailsSheetProps {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
    fullName: string | null;
    phone: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  SUSPENDED: "bg-red-500/10 text-red-500 border-red-500/20",
  DEACTIVATED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  LIBRARIAN: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  STUDENT: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE: "bg-emerald-500",
  PENDING: "bg-amber-500",
  SUSPENDED: "bg-red-500",
  DEACTIVATED: "bg-zinc-500",
};

type ConfirmAction = "suspend" | "deactivate" | "activate" | "delete" | null;

export function UserDetailsSheet({
  user,
  open,
  onOpenChange,
  onRefresh,
}: UserDetailsSheetProps) {
  const [actionPending, setActionPending] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Full user data with role-specific fields
  const [fullUser, setFullUser] = useState<{
    student?: {
      studentId: string;
      department: string | null;
      course: string | null;
    } | null;
    librarian?: {
      employeeId: string;
    } | null;
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchFullUser = useCallback(async () => {
    if (!user) return;
    setLoadingDetails(true);
    try {
      const data = await getUserById(user.id);
      setFullUser(data);
    } catch {
      // silently fail
    } finally {
      setLoadingDetails(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      fetchFullUser();
    } else {
      setFullUser(null);
    }
  }, [open, user, fetchFullUser]);

  if (!user) return null;

  const handleStatusAction = async (action: ConfirmAction) => {
    if (!action) return;
    setActionPending(true);
    try {
      let result;
      switch (action) {
        case "activate":
          result = await activateUser(user.id);
          break;
        case "suspend":
          result = await suspendUser(user.id);
          break;
        case "deactivate":
          result = await deactivateUser(user.id);
          break;
        case "delete":
          result = await deleteUser(user.id);
          break;
      }
      if (result?.success) {
        toast.success(result.message);
        setConfirmAction(null);
        onOpenChange(false);
        onRefresh?.();
      } else {
        toast.error(result?.message || "Action failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionPending(false);
    }
  };

  const confirmConfig: Record<
    string,
    {
      title: string;
      description: string;
      confirmLabel: string;
      variant: "destructive" | "warning" | "default";
    }
  > = {
    suspend: {
      title: "Suspend User",
      description: `Are you sure you want to suspend ${user.fullName || user.email}? They will be logged out and unable to access the system until reactivated.`,
      confirmLabel: "Suspend User",
      variant: "warning",
    },
    deactivate: {
      title: "Deactivate User",
      description: `Are you sure you want to deactivate ${user.fullName || user.email}? They will be logged out and their account will be marked as inactive.`,
      confirmLabel: "Deactivate",
      variant: "warning",
    },
    activate: {
      title: "Activate User",
      description: `Are you sure you want to activate ${user.fullName || user.email}? They will be able to log in and use the system.`,
      confirmLabel: "Activate",
      variant: "default",
    },
    delete: {
      title: "Delete User Permanently",
      description: `This will permanently delete ${user.fullName || user.email} and all their associated data including borrow history, reservations, and sessions. This action cannot be undone.`,
      confirmLabel: "Delete Permanently",
      variant: "destructive",
    },
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>View and manage user account</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* User Header with Status Dot */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-xl font-bold text-primary shadow-sm">
                  {user.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?"}
                </div>
                {/* Status dot */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${STATUS_DOT[user.status] || "bg-zinc-500"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">
                  {user.fullName || "Unknown"}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${ROLE_STYLES[user.role] || ""}`}
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${STATUS_STYLES[user.status] || ""}`}
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Details Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <IdCard className="w-4 h-4 text-muted-foreground" />
                Account Information
              </h4>
              <div className="space-y-3 pl-6">
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />

                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={user.phone || "—"}
                />
                <DetailRow
                  icon={Calendar}
                  label="Created"
                  value={new Date(user.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                />
              </div>
            </div>

            {/* Role-specific Details */}
            {loadingDetails ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading details...</span>
              </div>
            ) : (
              <>
                {fullUser?.student && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        Student Information
                      </h4>
                      <div className="space-y-3 pl-6">
                        <DetailRow
                          icon={IdCard}
                          label="Student ID"
                          value={fullUser.student.studentId}
                        />
                        <DetailRow
                          icon={Building2}
                          label="Department"
                          value={fullUser.student.department || "—"}
                        />
                        <DetailRow
                          icon={BookOpen}
                          label="Course"
                          value={fullUser.student.course || "—"}
                        />
                      </div>
                    </div>
                  </>
                )}

                {fullUser?.librarian && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        Librarian Information
                      </h4>
                      <div className="space-y-3 pl-6">
                        <DetailRow
                          icon={IdCard}
                          label="Employee ID"
                          value={fullUser.librarian.employeeId}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <Separator />

            {/* Actions */}
            {user.role !== "ADMIN" && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Actions
                </h4>

                {/* Edit */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 cursor-pointer text-foreground hover:bg-accent"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="w-4 h-4 text-primary" />
                  Edit Profile
                </Button>

                {/* Status Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {user.status !== "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 h-10 cursor-pointer text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => setConfirmAction("activate")}
                      disabled={actionPending}
                    >
                      <Shield className="w-4 h-4" />
                      Activate
                    </Button>
                  )}
                  {user.status !== "SUSPENDED" &&
                    user.status !== "DEACTIVATED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 h-10 cursor-pointer text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                        onClick={() => setConfirmAction("suspend")}
                        disabled={actionPending}
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Suspend
                      </Button>
                    )}
                  {user.status !== "DEACTIVATED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 h-10 cursor-pointer text-zinc-500 border-zinc-500/30 hover:bg-zinc-500/10"
                      onClick={() => setConfirmAction("deactivate")}
                      disabled={actionPending}
                    >
                      <ShieldOff className="w-4 h-4" />
                      Deactivate
                    </Button>
                  )}
                </div>

                {/* Delete */}
                <Separator />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 cursor-pointer text-red-500 border-red-500/30 hover:bg-red-500/10"
                  onClick={() => setConfirmAction("delete")}
                  disabled={actionPending}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialogs */}
      {confirmAction && confirmConfig[confirmAction] && (
        <ConfirmationDialog
          open={!!confirmAction}
          onOpenChange={(val) => {
            if (!val) setConfirmAction(null);
          }}
          title={confirmConfig[confirmAction].title}
          description={confirmConfig[confirmAction].description}
          confirmLabel={confirmConfig[confirmAction].confirmLabel}
          variant={confirmConfig[confirmAction].variant}
          loading={actionPending}
          onConfirm={() => handleStatusAction(confirmAction)}
        />
      )}

      {/* Edit User Dialog */}
      {editOpen && (
        <EditUserDialog
          user={{
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            phone: user.phone,
            student: fullUser?.student,
            librarian: fullUser?.librarian,
          }}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => {
            fetchFullUser();
            onRefresh?.();
          }}
        />
      )}
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <span className="text-sm font-medium text-right truncate">{value}</span>
    </div>
  );
}
