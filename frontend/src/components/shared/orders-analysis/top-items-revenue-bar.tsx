"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartTheme } from "./chart-theme";
import { formatCurrency } from "@/lib/utils";

type Item = { name: string; quantity: number; revenue: number };
type Props = { items: Item[] };

export function TopItemsRevenueBar({ items }: Props) {
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Top Items (by revenue)</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-muted-foreground">No item data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={items} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="name" tick={false} interval={0} height={0} stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis }} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{ background: chartTheme.tooltipBg, color: chartTheme.tooltipText, border: `1px solid ${chartTheme.grid}` }}
                labelStyle={{ color: chartTheme.tooltipText }}
                itemStyle={{ color: chartTheme.tooltipText }}
              />
              <Bar dataKey="revenue" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {items.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            Labels hidden to avoid overlap; hover bars for details.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

