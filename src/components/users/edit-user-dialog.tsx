"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateUser } from "@/actions/users";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface EditUserDialogProps {
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string | null;
    phone: string | null;
    student?: {
      studentId: string;
      department: string | null;
      course: string | null;
    } | null;
    librarian?: {
      employeeId: string;
    } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user.fullName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [department, setDepartment] = useState(
    user.student?.department || ""
  );
  const [course, setCourse] = useState(user.student?.course || "");

  // Reset form when user changes
  const resetForm = () => {
    setFullName(user.fullName || "");
    setPhone(user.phone || "");
    setDepartment(user.student?.department || "");
    setCourse(user.student?.course || "");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await updateUser(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        ...(user.role === "STUDENT" && {
          department: department.trim(),
          course: course.trim(),
        }),
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(result.message);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md glass-card border-border/50">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {user.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && (
            <Alert
              variant="destructive"
              className="border-destructive/30 bg-destructive/10"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-fullName">Full Name</Label>
            <Input
              id="edit-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
              className="h-10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="h-10 bg-background/50"
            />
          </div>

          {user.role === "STUDENT" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="h-10 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course">Course</Label>
                <Input
                  id="edit-course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech"
                  className="h-10 bg-background/50"
                />
              </div>
            </div>
          )}

          {user.role === "LIBRARIAN" && user.librarian && (
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input
                value={user.librarian.employeeId}
                disabled
                className="h-10 bg-muted/50 text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Employee ID cannot be changed
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="cursor-pointer"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
