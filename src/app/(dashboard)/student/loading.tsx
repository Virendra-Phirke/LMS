import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col gap-1">
        <Skeleton className="h-9 w-64 bg-muted/60" />
        <Skeleton className="h-5 w-80 bg-muted/60" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24 bg-muted/60" />
              <Skeleton className="h-10 w-10 rounded-xl bg-muted/60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2 bg-muted/60" />
              <Skeleton className="h-3 w-32 bg-muted/60" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-dashed">
        <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full bg-muted/60" />
          <Skeleton className="h-7 w-48 bg-muted/60" />
          <Skeleton className="h-4 w-64 bg-muted/60" />
          <Skeleton className="h-4 w-56 bg-muted/60" />
        </CardContent>
      </Card>
    </div>
  );
}
