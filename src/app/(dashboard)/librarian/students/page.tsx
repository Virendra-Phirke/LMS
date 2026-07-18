"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { CreateStudentDialog } from "@/components/users/create-student-dialog";
import { UsersDataTable } from "@/components/users/users-data-table";
import { getUsers } from "@/actions/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LibrarianStudentsPage() {
  const [, startTransition] = useTransition();
  const [data, setData] = useState<{
    users: Array<{
      id: string;
      email: string;
      role: string;
      status: string;
      emailVerified: boolean;
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
    status: "",
  });

  const fetchUsers = useCallback(() => {
    startTransition(async () => {
      // Librarians can only fetch users with the role "STUDENT"
      const result = await getUsers({
        page: filters.page,
        limit: 10,
        search: filters.search || undefined,
        role: "STUDENT", 
        status: filters.status || undefined,
      });
      setData(result);
    });
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    }, 300);
    setSearchTimeout(timeout);
  };

  return (
    <div className="space-y-6" role="main" aria-label="Student Management">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage student accounts
          </p>
        </div>
        <div className="flex gap-2">
          {/* Librarians can only create students */}
          <CreateStudentDialog />
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersDataTable
            users={data.users}
            pagination={data.pagination}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            onSearch={handleSearch}
            onRoleFilter={() => {}} // Disabled
            hideRoleFilter={true}
            onStatusFilter={(status) =>
              setFilters((prev) => ({
                ...prev,
                status: status === "all" ? "" : status,
                page: 1,
              }))
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
