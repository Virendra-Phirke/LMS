"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  
  
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsProps {
  borrowsByDate: { date: string; borrows: number }[];
  categoriesChart: { name: string; books: number }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AnalyticsCharts({ borrowsByDate, categoriesChart }: AnalyticsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Borrows Trend Line Chart */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Borrowing Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={borrowsByDate}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "white" }}
                itemStyle={{ color: "white" }}
              />
              <Line type="monotone" dataKey="borrows" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Popular Categories Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          {categoriesChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriesChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="books"
                >
                  {categoriesChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "white" }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Not enough data to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
