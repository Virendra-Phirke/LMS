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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserDetailsSheet } from "./user-details-sheet";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Eye, Inbox } from "lucide-react";

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

export function UsersDataTable({
  users,
  pagination,
  onPageChange,
  onSearch,
  onRoleFilter,
  onStatusFilter,
  hideRoleFilter = false,
}: UsersDataTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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
                    <Tooltip>
                      <TooltipTrigger 
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedUser(user);
                              setSheetOpen(true);
                            }}
                          />
                        }
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </TooltipTrigger>
                      <TooltipContent>View details</TooltipContent>
                    </Tooltip>
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
      />
    </>
  );
}
