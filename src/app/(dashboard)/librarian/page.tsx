import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLibrarianDashboardStats } from "@/actions/dashboard";

export default async function LibrarianDashboard() {
  const statsData = await getLibrarianDashboardStats();

  const stats = [
    {
      title: "Books Issued Today",
      value: statsData.issuedToday,
      icon: "📖",
      description: "Handled today",
      gradient: "from-blue-500/20 to-blue-600/5",
      iconBg: "bg-blue-500/15 border-blue-500/30",
    },
    {
      title: "Pending Reservations",
      value: statsData.pendingReservations,
      icon: "📋",
      description: "Awaiting approval",
      gradient: "from-amber-500/20 to-amber-600/5",
      iconBg: "bg-amber-500/15 border-amber-500/30",
    },
    {
      title: "Overdue Books",
      value: statsData.overdueBooks,
      icon: "⚠️",
      description: "Require follow up",
      gradient: "from-rose-500/20 to-rose-600/5",
      iconBg: "bg-rose-500/15 border-rose-500/30",
    },
    {
      title: "Unpaid Fines",
      value: statsData.unpaidFinesCount,
      icon: "💰",
      description: "Outstanding payments",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconBg: "bg-emerald-500/15 border-emerald-500/30",
    },
  ];

  return (
    <div className="space-y-8" role="main" aria-label="Librarian Dashboard Main Content">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Librarian Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage book circulation and reservations
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
              <span aria-hidden="true">📚</span> Book management modules will be available in the next phase.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
