"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

interface AnalyticsProps {
  borrowsByDate: { date: string; borrows: number }[];
  categoriesChart: { name: string; books: number }[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const borrowsConfig = {
  borrows: {
    label: "Borrows",
    color: "hsl(var(--primary))",
  },
};

export function AnalyticsCharts({ borrowsByDate, categoriesChart }: AnalyticsProps) {
  // Generate a dynamic config for pie chart based on categories
  const pieConfig = categoriesChart.reduce((acc, curr, index) => {
    acc[curr.name] = {
      label: curr.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const pieData = categoriesChart.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Borrows Trend Line Chart */}
      <Card className="glass-card border-border/50 col-span-1 md:col-span-2 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                Borrowing Trend
              </CardTitle>
              <CardDescription>Last 7 days of circulation activity</CardDescription>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={borrowsConfig} className="h-[300px] w-full">
            <LineChart data={borrowsByDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line 
                type="monotone" 
                dataKey="borrows" 
                stroke="var(--color-borrows)" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "var(--color-borrows)" }} 
                activeDot={{ r: 6, fill: "var(--color-borrows)" }} 
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Popular Categories Pie Chart */}
      <Card className="glass-card border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Categories</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/50 border border-accent flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-accent-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categoriesChart.length > 0 ? (
            <ChartContainer config={pieConfig} className="h-[300px] w-full pb-0 [&_.recharts-pie-label-text]:fill-foreground">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="books"
                  nameKey="name"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm font-medium text-foreground ml-1">{value}</span>}
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <PieChartIcon className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs text-muted-foreground mt-1">Add books with categories to see this chart.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
