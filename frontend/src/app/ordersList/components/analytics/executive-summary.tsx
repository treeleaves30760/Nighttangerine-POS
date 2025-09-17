"use client";

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calculator, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ExecutiveSummaryProps = {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    last30DaysOrders: number;
    last30DaysRevenue: number;
  };
  className?: string;
};

function formatGrowth(growth: number) {
  const sign = growth >= 0 ? "+" : "";
  return `${sign}${growth.toFixed(1)}%`;
}

function getGrowthIcon(growth: number) {
  return growth >= 0 ? TrendingUp : TrendingDown;
}

function getGrowthColor(growth: number) {
  return growth >= 0 ? "text-green-600" : "text-red-600";
}

export function ExecutiveSummary({ stats, className }: ExecutiveSummaryProps) {
  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: DollarSign,
      description: "All time revenue"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      growth: stats.ordersGrowth,
      icon: ShoppingCart,
      description: "All time orders"
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(stats.avgOrderValue),
      growth: 0, // Could calculate this if we track historical AOV
      icon: Calculator,
      description: "Average per order"
    },
    {
      title: "Last 30 Days",
      value: formatCurrency(stats.last30DaysRevenue),
      growth: stats.revenueGrowth,
      icon: Clock,
      description: `${stats.last30DaysOrders} orders`
    }
  ];

  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-4", className)}>
      {summaryCards.map((card, index) => {
        const GrowthIcon = getGrowthIcon(card.growth);
        const growthColor = getGrowthColor(card.growth);
        const IconComponent = card.icon;

        return (
          <Card key={index} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <IconComponent className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold mb-2">{card.value}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{card.description}</span>
                {card.growth !== 0 && (
                  <div className={cn("flex items-center gap-1", growthColor)}>
                    <GrowthIcon className="size-3" />
                    <span className="font-medium">{formatGrowth(card.growth)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}