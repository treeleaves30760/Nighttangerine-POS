"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/lib/orders";
import { formatCurrency } from "@/lib/utils";

type OrdersAnalysisProps = {
  orders: Order[];
};

export function OrdersAnalysis({ orders }: OrdersAnalysisProps) {
  const { totalOrders, totalRevenue, avgOrderValue, ordersByDay, revenueByDay, topItems } = useMemo(() => {
    const ordersByDay: Record<string, number> = {};
    const revenueByDay: Record<string, number> = {};
    const itemAgg: Record<string, { quantity: number; revenue: number }> = {};

    const totalRevenue = orders.reduce((acc, o) => {
      const sum = (o.items || []).reduce((s, it) => {
        const itemRevenue = it.price * it.quantity;
        const itemName = it.name || it.productId;
        itemAgg[itemName] = itemAgg[itemName]
          ? { quantity: itemAgg[itemName].quantity + it.quantity, revenue: itemAgg[itemName].revenue + itemRevenue }
          : { quantity: it.quantity, revenue: itemRevenue };
        return s + itemRevenue;
      }, 0);
      const day = new Date(o.createdAt).toISOString().split("T")[0];
      ordersByDay[day] = (ordersByDay[day] || 0) + 1;
      revenueByDay[day] = (revenueByDay[day] || 0) + sum;
      return acc + sum;
    }, 0);

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const chartData = Object.keys(ordersByDay).map(day => ({
      date: day,
      orders: ordersByDay[day],
      revenue: revenueByDay[day],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const topItems = Object.entries(itemAgg)
      .map(([name, v]) => ({ name, quantity: v.quantity, revenue: v.revenue }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByDay: chartData,
      revenueByDay: chartData,
      topItems,
    };
  }, [orders]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Avg. Order Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</div>
        </CardContent>
      </Card>
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Orders per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Revenue per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Top Items (by quantity)</CardTitle>
        </CardHeader>
        <CardContent>
          {topItems.length === 0 ? (
            <div className="text-muted-foreground">No item data available.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.map((it) => (
                  <TableRow key={it.name}>
                    <TableCell className="truncate max-w-[260px]" title={it.name}>{it.name}</TableCell>
                    <TableCell className="text-right">{it.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(it.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
