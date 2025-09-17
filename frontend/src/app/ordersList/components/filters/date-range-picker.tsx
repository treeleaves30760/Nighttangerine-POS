"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { format, startOfDay, endOfDay, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
};

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");

  useEffect(() => {
    setFromInput(value.from ? format(value.from, "yyyy-MM-dd") : "");
    setToInput(value.to ? format(value.to, "yyyy-MM-dd") : "");
  }, [value.from, value.to]);

  const handleFromChange = (dateStr: string) => {
    setFromInput(dateStr);
    if (dateStr) {
      const date = new Date(dateStr);
      if (isValid(date)) {
        onChange({
          from: startOfDay(date),
          to: value.to
        });
      }
    } else {
      onChange({
        from: null,
        to: value.to
      });
    }
  };

  const handleToChange = (dateStr: string) => {
    setToInput(dateStr);
    if (dateStr) {
      const date = new Date(dateStr);
      if (isValid(date)) {
        onChange({
          from: value.from,
          to: endOfDay(date)
        });
      }
    } else {
      onChange({
        from: value.from,
        to: null
      });
    }
  };

  const displayText = () => {
    if (!value.from && !value.to) return "Select date range";
    if (value.from && !value.to) return format(value.from, "MMM dd, yyyy") + " - ";
    if (!value.from && value.to) return " - " + format(value.to, "MMM dd, yyyy");
    if (value.from && value.to) {
      if (format(value.from, "yyyy-MM-dd") === format(value.to, "yyyy-MM-dd")) {
        return format(value.from, "MMM dd, yyyy");
      }
      return format(value.from, "MMM dd, yyyy") + " - " + format(value.to, "MMM dd, yyyy");
    }
    return "Select date range";
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "justify-between w-full min-w-72",
          !value.from && !value.to && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="size-4" />
          <span className="truncate">{displayText()}</span>
        </div>
        <ChevronDown className="size-4 opacity-50" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full mt-2 z-50 w-full min-w-80 bg-background border shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <input
                    type="date"
                    value={fromInput}
                    onChange={(e) => handleFromChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <input
                    type="date"
                    value={toInput}
                    onChange={(e) => handleToChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onChange({ from: null, to: null });
                      setIsOpen(false);
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Done
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