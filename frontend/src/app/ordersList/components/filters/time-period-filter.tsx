"use client";

import { useState } from "react";
import {
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker, type DateRange } from "./date-range-picker";
import { cn } from "@/lib/utils";

export type TimePeriodPreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export type TimePeriodFilterValue = {
  preset: TimePeriodPreset;
  dateRange: DateRange;
};

type TimePeriodFilterProps = {
  value: TimePeriodFilterValue;
  onChange: (value: TimePeriodFilterValue) => void;
  className?: string;
};

const presetOptions = [
  { key: "today" as const, label: "Today" },
  { key: "yesterday" as const, label: "Yesterday" },
  { key: "last7days" as const, label: "Last 7 days" },
  { key: "last30days" as const, label: "Last 30 days" },
  { key: "thisWeek" as const, label: "This week" },
  { key: "lastWeek" as const, label: "Last week" },
  { key: "thisMonth" as const, label: "This month" },
  { key: "lastMonth" as const, label: "Last month" },
  { key: "thisYear" as const, label: "This year" },
  { key: "custom" as const, label: "Custom range" },
];

function getDateRangeForPreset(preset: TimePeriodPreset): DateRange {
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
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case "lastWeek":
      const lastWeek = subWeeks(now, 1);
      return { from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth":
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    case "thisYear":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "custom":
      return { from: null, to: null };
    default:
      return { from: null, to: null };
  }
}

export function TimePeriodFilter({ value, onChange, className }: TimePeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: TimePeriodPreset) => {
    const dateRange = getDateRangeForPreset(preset);
    onChange({ preset, dateRange });
    if (preset !== "custom") {
      setIsOpen(false);
    }
  };

  const handleDateRangeChange = (dateRange: DateRange) => {
    onChange({ preset: "custom", dateRange });
  };

  const getCurrentPresetLabel = () => {
    const option = presetOptions.find(opt => opt.key === value.preset);
    return option?.label || "Select period";
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="justify-between min-w-40"
      >
        <span>{getCurrentPresetLabel()}</span>
        <span className="ml-2 opacity-50">▼</span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full mt-2 z-50 w-80 bg-background border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select Time Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {presetOptions.map((option) => (
                    <Button
                      key={option.key}
                      variant={value.preset === option.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetClick(option.key)}
                      className="justify-start"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                {value.preset === "custom" && (
                  <div className="pt-3 border-t">
                    <DateRangePicker
                      value={value.dateRange}
                      onChange={handleDateRangeChange}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onChange({ preset: "last30days", dateRange: getDateRangeForPreset("last30days") });
                      setIsOpen(false);
                    }}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}