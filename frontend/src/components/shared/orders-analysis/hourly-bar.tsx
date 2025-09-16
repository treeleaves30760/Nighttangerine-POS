"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "./chart-theme";

type Props = {
  data: { hour: string; orders: number }[];
};

export function HourlyBar({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders by Hour</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="hour" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} />
            <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} />
            <Tooltip
              contentStyle={{ background: chartTheme.tooltipBg, color: chartTheme.tooltipText, border: `1px solid ${chartTheme.grid}` }}
              labelStyle={{ color: chartTheme.tooltipText }}
              itemStyle={{ color: chartTheme.tooltipText }}
            />
            <Bar dataKey="orders" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

