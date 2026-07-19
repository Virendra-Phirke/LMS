import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border p-6 lg:p-8 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-muted/60" />
            <Skeleton className="h-8 w-64 bg-muted/60" />
            <Skeleton className="h-4 w-48 bg-muted/60" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 bg-muted/60" />
            <Skeleton className="h-9 w-28 bg-muted/60" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24 bg-muted/60" />
              <Skeleton className="h-10 w-10 rounded-xl bg-muted/60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2 bg-muted/60" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-32 bg-muted/60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-muted/60" />
                <Skeleton className="h-3 w-40 bg-muted/60" />
              </div>
              <Skeleton className="h-8 w-20 bg-muted/60" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-transparent bg-muted/10">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-muted/60" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-muted/60" />
                      <Skeleton className="h-3 w-48 bg-muted/60" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full bg-muted/60" />
                    <Skeleton className="h-5 w-16 rounded-full bg-muted/60" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-6 w-36 bg-muted/60" />
                <Skeleton className="h-3 w-48 bg-muted/60" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0 bg-muted/60" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 bg-muted/60" />
                    <Skeleton className="h-3 w-1/2 bg-muted/60" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full shrink-0 bg-muted/60" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
