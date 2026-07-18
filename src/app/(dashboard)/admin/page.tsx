import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUsers } from "@/actions/users";
import { getAdminDashboardStats } from "@/actions/dashboard";
import { Users, BookMarked, RefreshCw, Clock, Sparkles } from "lucide-react";

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
      icon: Users,
      description: "All registered accounts",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Total Books",
      value: statsData.totalBooks,
      icon: BookMarked,
      description: "Books in catalog",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Active Borrows",
      value: statsData.activeBorrows,
      icon: RefreshCw,
      description: "Books currently issued",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Pending Reservations",
      value: statsData.pendingReservations,
      icon: Clock,
      description: "Awaiting librarian approval",
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" role="main" aria-label="Admin Dashboard Main Content">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the library management system
        </p>
      </header>

      {/* Stats Grid */}
      <section aria-label="Key Statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={`glass-card bg-gradient-to-br ${stat.gradient} animate-in fade-in slide-in-from-bottom-4 duration-500 hover-scale`}
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                tabIndex={0}
                aria-label={`${stat.title}: ${stat.value}`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.iconBg} shadow-sm`}
                    aria-hidden="true"
                  >
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Users */}
      <section aria-label="Recent Users List">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Latest sign-ups and roles
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {usersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground">No users yet</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Create your first librarian or student account to see them listed here.
                </p>
              </div>
            ) : (
              <div className="space-y-3" role="list">
                {usersList.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors border border-transparent hover:border-border/50 gap-3 sm:gap-0"
                    role="listitem"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm" aria-hidden="true">
                        {user.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
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
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                          user.role === "ADMIN"
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : user.role === "LIBRARIAN"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}
                      >
                        {user.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : user.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
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
