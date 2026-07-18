import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUsers } from "@/actions/users";
import { getAdminDashboardStats } from "@/actions/dashboard";

export default async function AdminDashboard() {
  const [allUsers, statsData] = await Promise.all([
    getUsers({ limit: 5 }), // Only fetch top 5 for the recent users list
    getAdminDashboardStats(),
  ]);
  const usersList = allUsers.users;

  const stats = [
    {
      title: "Total Users",
      value: statsData.totalUsers,
      icon: "👥",
      description: "All registered accounts",
      gradient: "from-blue-500/20 to-blue-600/5",
      iconBg: "bg-blue-500/15 border-blue-500/30",
    },
    {
      title: "Total Books",
      value: statsData.totalBooks,
      icon: "📚",
      description: "Books in catalog",
      gradient: "from-amber-500/20 to-amber-600/5",
      iconBg: "bg-amber-500/15 border-amber-500/30",
    },
    {
      title: "Active Borrows",
      value: statsData.activeBorrows,
      icon: "🔄",
      description: "Books currently issued",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconBg: "bg-emerald-500/15 border-emerald-500/30",
    },
    {
      title: "Pending Reservations",
      value: statsData.pendingReservations,
      icon: "⏳",
      description: "Awaiting librarian approval",
      gradient: "from-rose-500/20 to-rose-600/5",
      iconBg: "bg-rose-500/15 border-rose-500/30",
    },
  ];

  return (
    <div className="space-y-8" role="main" aria-label="Admin Dashboard Main Content">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of the library management system
        </p>
      </header>

      {/* Stats Grid */}
      <section aria-label="Key Statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className={`border-border/50 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm`}
              tabIndex={0}
              aria-label={`${stat.title}: ${stat.value}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center ${stat.iconBg}`}
                  aria-hidden="true"
                >
                  <span className="text-lg">{stat.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Users */}
      <section aria-label="Recent Users List">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No users yet. Create your first librarian or student account.
              </p>
            ) : (
              <div className="space-y-3" role="list">
                {usersList.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-accent/30 focus-within:ring-2 focus-within:ring-ring gap-2 sm:gap-0"
                    role="listitem"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-sm font-semibold text-primary" aria-hidden="true">
                        {user.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user.fullName || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="sr-only">Email address: </span>{user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                            : user.role === "LIBRARIAN"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {user.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : user.status === "PENDING"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                            : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
