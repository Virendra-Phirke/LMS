import { getAnalyticsData } from "@/actions/analytics";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { requireAdmin } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Analytics - LMS Admin",
};

export default async function AdminAnalyticsPage() {
  const authError = await requireAdmin();
  if (authError) redirect("/login");

  const analyticsData = await getAnalyticsData();

  return (
    <div className="space-y-8" role="main" aria-label="Admin Analytics Dashboard">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Library Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Visual insights into borrowing trends, categories, and fine collection.
        </p>
      </header>

      <section aria-label="Analytics Charts">
        <AnalyticsCharts
          borrowsByDate={analyticsData.borrowsByDate}
          categoriesChart={analyticsData.categoriesChart}
        />
      </section>
    </div>
  );
}
