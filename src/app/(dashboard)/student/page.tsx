import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentDashboardStats } from "@/actions/dashboard";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session?.sub) redirect("/login");

  const statsData = await getStudentDashboardStats(session.sub);

  const stats = [
    {
      title: "Books Borrowed",
      value: statsData.activeBorrows,
      icon: "📚",
      description: "Currently in possession",
      gradient: "from-blue-500/20 to-blue-600/5",
      iconBg: "bg-blue-500/15 border-blue-500/30",
    },
    {
      title: "Pending Reservations",
      value: statsData.pendingReservations,
      icon: "📋",
      description: "Awaiting librarian",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconBg: "bg-emerald-500/15 border-emerald-500/30",
    },
    {
      title: "Unpaid Fines",
      value: `₹${statsData.unpaidFinesTotal.toFixed(2)}`,
      icon: "💰",
      description: `${statsData.finesCount} pending invoices`,
      gradient: "from-amber-500/20 to-amber-600/5",
      iconBg: "bg-amber-500/15 border-amber-500/30",
    },
    {
      title: "Due Soon",
      value: "0", // Will be implemented with due date logic later
      icon: "⏰",
      description: "Books due within 3 days",
      gradient: "from-rose-500/20 to-rose-600/5",
      iconBg: "bg-rose-500/15 border-rose-500/30",
    },
  ];

  return (
    <div className="space-y-8" role="main" aria-label="Student Dashboard Main Content">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Student Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          View your books, reservations, and account details
        </p>
      </header>

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

      <section aria-label="Dashboard Features">
        <Card className="border-border/50 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              <span aria-hidden="true">🎓</span> Book search and borrowing features will be available soon.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
