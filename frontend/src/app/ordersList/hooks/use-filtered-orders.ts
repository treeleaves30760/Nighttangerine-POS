"use client";

import { useMemo } from "react";
import { isWithinInterval, parseISO, isValid } from "date-fns";
import { Order } from "@/lib/orders";
import { type TimePeriodFilterValue } from "../components/filters/time-period-filter";

export type OrdersFilterOptions = {
  timePeriod: TimePeriodFilterValue;
  status?: string[];
  searchQuery?: string;
};

export function useFilteredOrders(orders: Order[], filters: OrdersFilterOptions) {
  return useMemo(() => {
    let filtered = [...orders];

    // Filter by time period
    if (filters.timePeriod.dateRange.from || filters.timePeriod.dateRange.to) {
      filtered = filtered.filter((order) => {
        const orderDate = parseISO(order.createdAt);
        if (!isValid(orderDate)) return false;

        const { from, to } = filters.timePeriod.dateRange;

        if (from && to) {
          return isWithinInterval(orderDate, { start: from, end: to });
        } else if (from) {
          return orderDate >= from;
        } else if (to) {
          return orderDate <= to;
        }

        return true;
      });
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((order) => filters.status!.includes(order.status));
    }

    // Filter by search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        const searchableText = [
          order.number.toString(),
          order.status,
          ...(order.items || []).map(item => item.name.toLowerCase())
        ].join(" ");
        return searchableText.includes(query);
      });
    }

    return filtered;
  }, [orders, filters]);
}

export function useOrdersStats(orders: Order[]) {
  return useMemo(() => {
    const now = new Date();
    const totalOrders = orders.length;

    const totalRevenue = orders.reduce((acc, order) => {
      return acc + (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth metrics (comparing with previous period)
    const last30Days = orders.filter(order => {
      const orderDate = parseISO(order.createdAt);
      return isValid(orderDate) && (now.getTime() - orderDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
    });

    const last30DaysRevenue = last30Days.reduce((acc, order) => {
      return acc + (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, 0);

    const previous30Days = orders.filter(order => {
      const orderDate = parseISO(order.createdAt);
      const daysDiff = (now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000);
      return isValid(orderDate) && daysDiff > 30 && daysDiff <= 60;
    });

    const previous30DaysRevenue = previous30Days.reduce((acc, order) => {
      return acc + (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, 0);

    const revenueGrowth = previous30DaysRevenue > 0
      ? ((last30DaysRevenue - previous30DaysRevenue) / previous30DaysRevenue) * 100
      : 0;

    const ordersGrowth = previous30Days.length > 0
      ? ((last30Days.length - previous30Days.length) / previous30Days.length) * 100
      : 0;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusCounts,
      revenueGrowth,
      ordersGrowth,
      last30DaysOrders: last30Days.length,
      last30DaysRevenue,
    };
  }, [orders]);
}