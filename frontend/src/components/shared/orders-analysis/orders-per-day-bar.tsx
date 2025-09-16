"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "./chart-theme";

type Props = {
  data: { date: string; orders: number; revenue: number }[];
};

export function OrdersPerDayBar({ data }: Props) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Orders per Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="date" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} />
            <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} />
            <Tooltip
              contentStyle={{ background: chartTheme.tooltipBg, color: chartTheme.tooltipText, border: `1px solid ${chartTheme.grid}` }}
              labelStyle={{ color: chartTheme.tooltipText }}
              itemStyle={{ color: chartTheme.tooltipText }}
            />
            <Bar dataKey="orders" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

