"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { CreateLibrarianDialog } from "@/components/users/create-librarian-dialog";
import { CreateStudentDialog } from "@/components/users/create-student-dialog";
import { UsersDataTable } from "@/components/users/users-data-table";
import { getUsers } from "@/actions/users";
import type { UserRole } from "@/types";
import { Users, UserCheck, Clock, ShieldOff } from "lucide-react";

export default function UsersManagementPage() {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<{
    users: Array<{
      id: string;
      email: string;
      role: string;
      status: string;
      createdAt: Date;
      fullName: string | null;
      phone: string | null;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({ users: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

  const [filters, setFilters] = useState({
    page: 1,
    search: "",
    role: "" as UserRole | "",
    status: "",
  });

  const fetchUsers = useCallback(() => {
    startTransition(async () => {
      const result = await getUsers({
        page: filters.page,
        limit: 10,
        search: filters.search || undefined,
        role: (filters.role || undefined) as UserRole | undefined,
        status: filters.status || undefined,
      });
      setData(result);
    });
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    }, 300);
    setSearchTimeout(timeout);
  };

  // Summary stats from loaded data
  const summaryStats = [
    {
      label: "Total",
      value: data.pagination.total,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      label: "Active",
      value: data.users.filter((u) => u.status === "ACTIVE").length,
      icon: UserCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Pending",
      value: data.users.filter((u) => u.status === "PENDING").length,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Suspended",
      value: data.users.filter((u) => u.status === "SUSPENDED").length,
      icon: ShieldOff,
      color: "text-red-500",
      bg: "bg-red-500/10 border-red-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage librarian and student accounts
          </p>
        </div>
        <div className="flex gap-2">
          <CreateStudentDialog />
          <CreateLibrarianDialog />
        </div>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-sm"
            >
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${stat.bg}`}
              >
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Users</CardTitle>
            <Badge variant="outline" className="text-xs font-medium">
              {data.pagination.total} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <TableSkeleton columns={6} rows={10} />
          ) : (
            <UsersDataTable
              users={data.users}
              pagination={data.pagination}
              onPageChange={(page) =>
                setFilters((prev) => ({ ...prev, page }))
              }
              onSearch={handleSearch}
              onRoleFilter={(role) =>
                setFilters((prev) => ({
                  ...prev,
                  role: role === "all" ? "" : (role as UserRole),
                  page: 1,
                }))
              }
              onStatusFilter={(status) =>
                setFilters((prev) => ({
                  ...prev,
                  status: status === "all" ? "" : status,
                  page: 1,
                }))
              }
              onRefresh={fetchUsers}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
