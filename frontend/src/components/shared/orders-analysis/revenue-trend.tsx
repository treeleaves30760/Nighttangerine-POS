"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "./chart-theme";

type Props = {
  data: { date: string; revenue: number; cumulative: number; ma7: number }[];
};

export function RevenueTrend({ data }: Props) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Revenue per Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="date" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} />
            <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} />
            <Tooltip
              contentStyle={{ background: chartTheme.tooltipBg, color: chartTheme.tooltipText, border: `1px solid ${chartTheme.grid}` }}
              labelStyle={{ color: chartTheme.tooltipText }}
              itemStyle={{ color: chartTheme.tooltipText }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#34d399" dot={false} />
            <Line type="monotone" dataKey="ma7" stroke="#f59e0b" dot={false} strokeDasharray="6 4" />
            <Line type="monotone" dataKey="cumulative" stroke="#818cf8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

