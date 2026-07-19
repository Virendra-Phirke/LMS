"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { UserDetailsSheet } from "./user-details-sheet";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Eye,
  Inbox,
  MoreHorizontal,
  Pencil,
  Shield,
  ShieldAlert,
  ShieldOff,
  Trash2,
} from "lucide-react";
import {
  suspendUser,
  activateUser,
  deactivateUser,
  deleteUser,
} from "@/actions/users";
import { toast } from "sonner";
import { EditUserDialog } from "./edit-user-dialog";

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
  fullName: string | null;
  phone: string | null;
}

interface UsersDataTableProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onRoleFilter: (role: string) => void;
  onStatusFilter: (status: string) => void;
  onRefresh?: () => void;
  hideRoleFilter?: boolean;
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

type ConfirmAction = {
  type: "suspend" | "deactivate" | "activate" | "delete";
  user: User;
} | null;

export function UsersDataTable({
  users,
  pagination,
  onPageChange,
  onSearch,
  onRoleFilter,
  onStatusFilter,
  onRefresh,
  hideRoleFilter = false,
}: UsersDataTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionPending, setActionPending] = useState(false);

  const handleConfirmedAction = async () => {
    if (!confirmAction) return;
    setActionPending(true);
    try {
      let result;
      switch (confirmAction.type) {
        case "activate":
          result = await activateUser(confirmAction.user.id);
          break;
        case "suspend":
          result = await suspendUser(confirmAction.user.id);
          break;
        case "deactivate":
          result = await deactivateUser(confirmAction.user.id);
          break;
        case "delete":
          result = await deleteUser(confirmAction.user.id);
          break;
      }
      if (result?.success) {
        toast.success(result.message);
        setConfirmAction(null);
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

  const getConfirmConfig = (action: ConfirmAction) => {
    if (!action) return null;
    const name = action.user.fullName || action.user.email;
    const configs = {
      suspend: {
        title: "Suspend User",
        description: `Are you sure you want to suspend ${name}? They will be logged out and unable to access the system.`,
        confirmLabel: "Suspend User",
        variant: "warning" as const,
      },
      deactivate: {
        title: "Deactivate User",
        description: `Are you sure you want to deactivate ${name}? They will be logged out and their account marked as inactive.`,
        confirmLabel: "Deactivate",
        variant: "warning" as const,
      },
      activate: {
        title: "Activate User",
        description: `Are you sure you want to activate ${name}? They will be able to log in and use the system.`,
        confirmLabel: "Activate",
        variant: "default" as const,
      },
      delete: {
        title: "Delete User Permanently",
        description: `This will permanently delete ${name} and all their associated data. This action cannot be undone.`,
        confirmLabel: "Delete Permanently",
        variant: "destructive" as const,
      },
    };
    return configs[action.type];
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search by name or email..."
          className="sm:max-w-xs h-10 bg-background/50"
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search users"
        />
        {!hideRoleFilter && (
          <Select onValueChange={(val) => onRoleFilter(val || "all")} defaultValue="all">
            <SelectTrigger className="w-full sm:w-[140px] h-10 bg-background/50" aria-label="Filter by role">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="LIBRARIAN">Librarian</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select onValueChange={(val) => onStatusFilter(val || "all")} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[140px] h-10 bg-background/50">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Inbox className="h-10 w-10 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="group hover:bg-accent/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shadow-sm">
                        {user.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "?"}
                      </div>
                      <span className="font-medium text-sm">
                        {user.fullName || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${ROLE_STYLES[user.role] || ""}`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${STATUS_STYLES[user.status] || ""}`}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => {
                            setSelectedUser(user);
                            setSheetOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        {user.role !== "ADMIN" && (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2"
                              onClick={() => setEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {user.status !== "ACTIVE" && (
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 text-emerald-500 focus:text-emerald-500"
                                onClick={() =>
                                  setConfirmAction({ type: "activate", user })
                                }
                              >
                                <Shield className="h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}

                            {user.status !== "SUSPENDED" &&
                              user.status !== "DEACTIVATED" && (
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 text-amber-500 focus:text-amber-500"
                                  onClick={() =>
                                    setConfirmAction({ type: "suspend", user })
                                  }
                                >
                                  <ShieldAlert className="h-4 w-4" />
                                  Suspend
                                </DropdownMenuItem>
                              )}

                            {user.status !== "DEACTIVATED" && (
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 text-zinc-500 focus:text-zinc-500"
                                onClick={() =>
                                  setConfirmAction({ type: "deactivate", user })
                                }
                              >
                                <ShieldOff className="h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="cursor-pointer gap-2 text-red-500 focus:text-red-500 focus:bg-red-500/10"
                              onClick={() =>
                                setConfirmAction({ type: "delete", user })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        totalItems={pagination.total}
        limit={pagination.limit}
      />

      {/* User Details Sheet */}
      <UserDetailsSheet
        user={selectedUser}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRefresh={onRefresh}
      />

      {/* Edit User Dialog */}
      {editUser && (
        <EditUserDialog
          user={{
            id: editUser.id,
            email: editUser.email,
            role: editUser.role,
            fullName: editUser.fullName,
            phone: editUser.phone,
          }}
          open={!!editUser}
          onOpenChange={(val) => {
            if (!val) setEditUser(null);
          }}
          onSuccess={onRefresh}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmationDialog
          open={!!confirmAction}
          onOpenChange={(val) => {
            if (!val) setConfirmAction(null);
          }}
          title={getConfirmConfig(confirmAction)!.title}
          description={getConfirmConfig(confirmAction)!.description}
          confirmLabel={getConfirmConfig(confirmAction)!.confirmLabel}
          variant={getConfirmConfig(confirmAction)!.variant}
          loading={actionPending}
          onConfirm={handleConfirmedAction}
        />
      )}
    </>
  );
}
