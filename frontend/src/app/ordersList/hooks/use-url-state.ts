"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startOfDay, endOfDay, subDays, isValid, parseISO } from "date-fns";
import { type TimePeriodFilterValue, type TimePeriodPreset } from "../components/filters/time-period-filter";

export function useUrlFilterState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [timePeriodFilter, setTimePeriodFilter] = useState<TimePeriodFilterValue>({
    preset: "last30days",
    dateRange: {
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date())
    }
  });

  // Initialize state from URL params on mount
  useEffect(() => {
    const preset = searchParams.get("period") as TimePeriodPreset | null;
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    if (preset && ["today", "yesterday", "last7days", "last30days", "thisWeek", "lastWeek", "thisMonth", "lastMonth", "thisYear", "custom"].includes(preset)) {
      let dateRange = timePeriodFilter.dateRange;

      // If custom range with valid dates
      if (preset === "custom" && fromDate && toDate) {
        const from = parseISO(fromDate);
        const to = parseISO(toDate);
        if (isValid(from) && isValid(to)) {
          dateRange = { from: startOfDay(from), to: endOfDay(to) };
        }
      } else {
        // For preset filters, calculate the date range
        dateRange = getDateRangeForPreset(preset);
      }

      setTimePeriodFilter({ preset, dateRange });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateUrlState = useCallback((newFilter: TimePeriodFilterValue) => {
    const params = new URLSearchParams();

    params.set("period", newFilter.preset);

    if (newFilter.preset === "custom" && newFilter.dateRange.from && newFilter.dateRange.to) {
      params.set("from", newFilter.dateRange.from.toISOString().split("T")[0]);
      params.set("to", newFilter.dateRange.to.toISOString().split("T")[0]);
    }

    // Use replace to avoid adding to browser history for every filter change
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  const setTimePeriodFilterWithUrl = useCallback((newFilter: TimePeriodFilterValue) => {
    setTimePeriodFilter(newFilter);
    updateUrlState(newFilter);
  }, [updateUrlState]);

  return {
    timePeriodFilter,
    setTimePeriodFilter: setTimePeriodFilterWithUrl
  };
}

function getDateRangeForPreset(preset: string) {
  const now = new Date();

  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday":
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    case "last7days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "last30days":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "thisWeek":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
      return { from: startOfDay(startOfWeek), to: endOfDay(now) };
    case "lastWeek":
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 6); // Last Monday
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6); // Last Sunday
      return { from: startOfDay(lastWeekStart), to: endOfDay(lastWeekEnd) };
    case "thisMonth":
      return { from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), to: endOfDay(now) };
    case "lastMonth":
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: startOfDay(lastMonth), to: endOfDay(lastMonthEnd) };
    case "thisYear":
      return { from: startOfDay(new Date(now.getFullYear(), 0, 1)), to: endOfDay(now) };
    default:
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
  }
}