import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getUsers } from "@/actions/users";
import { getAdminDashboardStats, getAdminRecentActivity } from "@/actions/dashboard";
import Link from "next/link";
import {
  Users,
  BookMarked,
  RefreshCw,
  Clock,
  Sparkles,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  BookUp,
  BookDown,
  ArrowRight,
  Activity,
  UserCheck,
} from "lucide-react";

export default async function AdminDashboard() {
  const [allUsers, statsData, recentActivity] = await Promise.all([
    getUsers({ limit: 5 }),
    getAdminDashboardStats(),
    getAdminRecentActivity(),
  ]);
  const usersList = allUsers.users;

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const stats = [
    {
      title: "Total Users",
      value: statsData.totalUsers,
      icon: Users,
      description: "All registered accounts",
      trend: `+${statsData.newUsersThisWeek} this week`,
      gradient:
        "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      trendColor: "text-blue-500",
    },
    {
      title: "Total Books",
      value: statsData.totalBooks,
      icon: BookMarked,
      description: "Books in catalog",
      trend: null,
      gradient:
        "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      trendColor: "text-amber-500",
    },
    {
      title: "Active Borrows",
      value: statsData.activeBorrows,
      icon: RefreshCw,
      description: "Books currently issued",
      trend: statsData.overdueBooks > 0 ? `${statsData.overdueBooks} overdue` : null,
      gradient:
        "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      trendColor: statsData.overdueBooks > 0 ? "text-red-500" : "text-emerald-500",
    },
    {
      title: "Pending Reservations",
      value: statsData.pendingReservations,
      icon: Clock,
      description: "Awaiting librarian approval",
      trend: null,
      gradient:
        "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      trendColor: "text-rose-500",
    },
  ];

  return (
    <div
      className="space-y-8 animate-in fade-in duration-500"
      role="main"
      aria-label="Admin Dashboard Main Content"
    >
      {/* Welcome Banner */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary/80 mb-1">
                {greeting}, Admin 👋
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Overview of the library management system
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer bg-background/50 backdrop-blur-sm"
                render={<Link href="/admin/users" />}
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
              <Button
                size="sm"
                className="gap-2 cursor-pointer"
                render={<Link href="/admin/books" />}
              >
                <BookMarked className="w-4 h-4" />
                Add Book
              </Button>
            </div>
          </div>
        </div>
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
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: "both",
                }}
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
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground/80">
                      {stat.description}
                    </p>
                    {stat.trend && (
                      <span
                        className={`text-[11px] font-semibold ${stat.trendColor} flex items-center gap-0.5`}
                      >
                        {stat.trendColor?.includes("red") ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {stat.trend}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Users */}
        <section aria-label="Recent Users List" className="lg:col-span-3">
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Users</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Latest sign-ups and roles
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs cursor-pointer text-primary hover:text-primary"
                render={<Link href="/admin/users" />}
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {usersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-base font-medium text-foreground">
                    No users yet
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Create your first librarian or student account to see them
                    listed here.
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
                        <div
                          className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shadow-sm"
                          aria-hidden="true"
                        >
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
                            <span className="sr-only">Email address: </span>
                            {user.email}
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

        {/* Recent Activity Feed */}
        <section aria-label="Recent Activity" className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Latest circulation events
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium">No recent activity</p>
                  <p className="text-xs text-muted-foreground">
                    Borrow and return events will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentActivity.map((activity, i) => (
                    <div key={activity.id}>
                      <div className="flex items-start gap-3 py-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            activity.type === "return"
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-blue-500/10 border border-blue-500/20"
                          }`}
                        >
                          {activity.type === "return" ? (
                            <BookDown className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <BookUp className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.userName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.type === "return"
                              ? "Returned"
                              : "Borrowed"}{" "}
                            <span className="font-mono text-[11px]">
                              {activity.barcode}
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                            {new Date(activity.timestamp).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0 shrink-0 ${
                            activity.status === "RETURNED"
                              ? "text-emerald-500 border-emerald-500/20"
                              : activity.status === "OVERDUE"
                                ? "text-red-500 border-red-500/20"
                                : "text-blue-500 border-blue-500/20"
                          }`}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                      {i < recentActivity.length - 1 && (
                        <Separator className="opacity-50" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Quick System Health */}
      {statsData.overdueBooks > 0 && (
        <section aria-label="System Alerts">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-500">
                    {statsData.overdueBooks} Overdue Book
                    {statsData.overdueBooks > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Books past their due date that need attention
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer"
                  render={<Link href="/admin/analytics" />}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
