"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { chartTheme } from "./chart-theme";

type Props = {
  data: { name: string; key: string; value: number }[];
};

export function StatusPie({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
              {data.map((_, i) => (
                <Cell key={i} fill={["#facc15", "#60a5fa", "#34d399"][i % 3]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: chartTheme.legend }} />
            <Tooltip
              contentStyle={{ background: chartTheme.tooltipBg, color: chartTheme.tooltipText, border: `1px solid ${chartTheme.grid}` }}
              labelStyle={{ color: chartTheme.tooltipText }}
              itemStyle={{ color: chartTheme.tooltipText }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

