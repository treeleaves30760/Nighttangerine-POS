"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { Order } from "@/lib/orders";
import { formatCurrency } from "@/lib/utils";
import { StatusPie } from "./status-pie";
import { WeekdayBar } from "./weekday-bar";
import { HourlyBar } from "./hourly-bar";
import { OrdersPerDayBar } from "./orders-per-day-bar";
import { RevenueTrend } from "./revenue-trend";
import { SizeDistribution } from "./size-distribution";
import { TopItemsQuantityTable } from "./top-items-quantity-table";
import { TopItemsRevenueBar } from "./top-items-revenue-bar";
import { useOrdersAnalytics } from "./use-orders-analytics";

type OrdersAnalysisProps = {
  orders: Order[];
};

export function OrdersAnalysis({ orders }: OrdersAnalysisProps) {
  const metrics = useOrdersAnalytics(orders);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4 text-[18px] md:text-[20px]">
      <Card>
        <CardHeader>
          <CardTitle>Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalOrders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Avg. Order Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.avgOrderValue)}</div>
        </CardContent>
      </Card>

      <StatusPie data={metrics.statusDist} />
      <WeekdayBar data={metrics.weekdayData} />
      <HourlyBar data={metrics.hourlyData} />

      <OrdersPerDayBar data={metrics.ordersByDay} />
      <RevenueTrend data={metrics.revenueTrend} />
      <SizeDistribution data={metrics.sizeDist} />

      <TopItemsQuantityTable items={metrics.topItems} />
      <TopItemsRevenueBar items={metrics.topItemsByRevenue} />
    </div>
  );
}

