import { useMemo } from "react";
import { Order } from "@/lib/orders";

export function useOrdersAnalytics(orders: Order[]) {
  return useMemo(() => {
    const ordersByDay: Record<string, number> = {};
    const revenueByDay: Record<string, number> = {};
    const itemAgg: Record<string, { quantity: number; revenue: number }> = {};
    const statusCounts: Record<string, number> = { pending: 0, preparing: 0, finished: 0 };
    const weekdayAgg: Record<number, { orders: number; revenue: number }> = {
      0: { orders: 0, revenue: 0 },
      1: { orders: 0, revenue: 0 },
      2: { orders: 0, revenue: 0 },
      3: { orders: 0, revenue: 0 },
      4: { orders: 0, revenue: 0 },
      5: { orders: 0, revenue: 0 },
      6: { orders: 0, revenue: 0 },
    };
    const hourlyAgg: Record<number, number> = Object.fromEntries(
      Array.from({ length: 24 }, (_, h) => [h, 0])
    ) as Record<number, number>;
    const sizeBuckets: Record<string, number> = {
      "1": 0,
      "2": 0,
      "3-5": 0,
      "6-10": 0,
      "11+": 0,
    };

    const totalRevenue = orders.reduce((acc, o) => {
      const sum = (o.items || []).reduce((s, it) => {
        const itemRevenue = it.price * it.quantity;
        const itemName = it.name || it.productId;
        itemAgg[itemName] = itemAgg[itemName]
          ? { quantity: itemAgg[itemName].quantity + it.quantity, revenue: itemAgg[itemName].revenue + itemRevenue }
          : { quantity: it.quantity, revenue: itemRevenue };
        return s + itemRevenue;
      }, 0);
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      const day = new Date(o.createdAt).toISOString().split("T")[0];
      ordersByDay[day] = (ordersByDay[day] || 0) + 1;
      revenueByDay[day] = (revenueByDay[day] || 0) + sum;

      const dt = new Date(o.createdAt);
      const weekday = dt.getDay();
      weekdayAgg[weekday].orders += 1;
      weekdayAgg[weekday].revenue += sum;
      const hour = dt.getHours();
      hourlyAgg[hour] = (hourlyAgg[hour] || 0) + 1;

      const itemCount = (o.items || []).reduce((c, it) => c + it.quantity, 0);
      if (itemCount <= 1) sizeBuckets["1"] += 1;
      else if (itemCount === 2) sizeBuckets["2"] += 1;
      else if (itemCount <= 5) sizeBuckets["3-5"] += 1;
      else if (itemCount <= 10) sizeBuckets["6-10"] += 1;
      else sizeBuckets["11+"] += 1;
      return acc + sum;
    }, 0);

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const chartData = Object.keys(ordersByDay)
      .map((day) => ({ date: day, orders: ordersByDay[day], revenue: revenueByDay[day] }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const topItems = Object.entries(itemAgg)
      .map(([name, v]) => ({ name, quantity: v.quantity, revenue: v.revenue }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const topItemsByRevenue = Object.entries(itemAgg)
      .map(([name, v]) => ({ name, quantity: v.quantity, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const statusDist = [
      { name: "Pending", key: "pending", value: statusCounts["pending"] || 0 },
      { name: "Preparing", key: "preparing", value: statusCounts["preparing"] || 0 },
      { name: "Finished", key: "finished", value: statusCounts["finished"] || 0 },
    ];

    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayData = Object.keys(weekdayAgg).map((k) => {
      const idx = Number(k);
      return {
        weekday: weekdayNames[idx],
        orders: weekdayAgg[idx].orders,
        revenue: weekdayAgg[idx].revenue,
      };
    });

    const hourlyData = Object.keys(hourlyAgg)
      .map((h) => ({ hour: `${h}:00`, orders: hourlyAgg[Number(h)] }))
      .sort((a, b) => Number(a.hour.split(":")[0]) - Number(b.hour.split(":")[0]));

    const sizeDist = Object.keys(sizeBuckets).map((k) => ({ size: k, orders: sizeBuckets[k] }));

    let running = 0;
    const revenueTrendBase = chartData.map((d) => {
      running += d.revenue;
      return { date: d.date, revenue: d.revenue, cumulative: running };
    });
    const window = 7;
    const revenueTrend = revenueTrendBase.map((d, i, arr) => {
      const start = Math.max(0, i - window + 1);
      const slice = arr.slice(start, i + 1);
      const ma = slice.reduce((s, x) => s + x.revenue, 0) / slice.length;
      return { ...d, ma7: ma };
    });

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByDay: chartData,
      revenueByDay: chartData,
      topItems,
      topItemsByRevenue,
      statusDist,
      weekdayData,
      hourlyData,
      sizeDist,
      revenueTrend,
    };
  }, [orders]);
}

