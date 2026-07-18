import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLibrarianDashboardStats } from "@/actions/dashboard";
import { BookOpen, ClipboardList, AlertTriangle, Coins, Library } from "lucide-react";

export default async function LibrarianDashboard() {
  const statsData = await getLibrarianDashboardStats();

  const stats = [
    {
      title: "Books Issued Today",
      value: statsData.issuedToday,
      icon: BookOpen,
      description: "Handled today",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Pending Reservations",
      value: statsData.pendingReservations,
      icon: ClipboardList,
      description: "Awaiting approval",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Overdue Books",
      value: statsData.overdueBooks,
      icon: AlertTriangle,
      description: "Require follow up",
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Unpaid Fines",
      value: statsData.unpaidFinesCount,
      icon: Coins,
      description: "Outstanding payments",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" role="main" aria-label="Librarian Dashboard Main Content">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Librarian Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage book circulation and reservations
        </p>
      </header>

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

      <section aria-label="Dashboard Features">
        <Card className="glass-card border-dashed bg-card/20 hover:bg-card/40 transition-colors">
          <CardContent className="py-16 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
              <Library className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Book Management</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Advanced catalog modules, real-time tracking, and automated fine calculations will be available in the next phase.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
