"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  subMonths,
  addMonths,
  isWithinInterval,
  isBefore,
  isAfter,
  differenceInDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type DatePickerMode = "single" | "range";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerProps {
  mode?: DatePickerMode;
  startDate?: string; // yyyy-mm-dd format
  endDate?: string; // yyyy-mm-dd format
  onDateRangeChange?: (startDate: string, endDate?: string) => void;
  allowFutureDates?: boolean;
  allowPastDates?: boolean;
  maxSelectionDays?: number; // Maximum days allowed in range mode (default: 31)
}

export function DateRangePicker({
  mode = "range",
  startDate,
  endDate,
  onDateRangeChange,
  allowFutureDates = false,
  allowPastDates = true,
  maxSelectionDays = 31,
}: DateRangePickerProps) {
  const defaultStartDate = useMemo(() => {
    if (startDate) {
      return new Date(startDate);
    }
    return null;
  }, [startDate]);

  const defaultEndDate = useMemo(() => {
    if (endDate) {
      return new Date(endDate);
    }
    return null;
  }, [endDate]);

  const [dateRange, setDateRange] = useState<DateRange>({
    start: defaultStartDate,
    end: mode === "single" ? null : defaultEndDate,
  });

  const [firstMonth, setFirstMonth] = useState(defaultStartDate || new Date());
  const [secondMonth, setSecondMonth] = useState(addMonths(defaultStartDate || new Date(), 1));
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const isDateDisabled = (date: Date) => {
    const isFutureDate = isAfter(date, today);
    const isPastDate = isBefore(date, today);

    if (!allowFutureDates && isFutureDate) return true;
    if (!allowPastDates && isPastDate) return true;

    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) {
      return;
    }

    if (mode === "single") {
      setDateRange({ start: date, end: null });
      setNotification({ show: false, message: "" });
    } else {
      if (!dateRange.start || (dateRange.start && dateRange.end)) {
        setDateRange({ start: date, end: null });
        setNotification({ show: false, message: "" });
      } else if (isBefore(date, dateRange.start)) {
        // Check if the range would exceed max selection days
        const daysDifference = differenceInDays(dateRange.start, date);
        if (daysDifference <= maxSelectionDays) {
          setDateRange({ start: date, end: dateRange.start });
          setNotification({ show: false, message: "" });
        } else {
          // Show notification when exceeding max days
          setNotification({
            show: true,
            message: `Maximum selection is ${maxSelectionDays} days. Please select a shorter range.`,
          });
        }
      } else {
        // Check if the range would exceed max selection days
        const daysDifference = differenceInDays(date, dateRange.start);
        if (daysDifference <= maxSelectionDays) {
          setDateRange({ start: dateRange.start, end: date });
          setNotification({ show: false, message: "" });
        } else {
          // Show notification when exceeding max days
          setNotification({
            show: true,
            message: `Maximum selection is ${maxSelectionDays} days. Please select a shorter range.`,
          });
        }
      }
    }
  };

  const handleApply = () => {
    if (mode === "single" && dateRange.start) {
      onDateRangeChange?.(format(dateRange.start, "yyyy-MM-dd"));
      setIsOpen(false);
    } else if (mode === "range" && dateRange.start && dateRange.end) {
      onDateRangeChange?.(format(dateRange.start, "yyyy-MM-dd"), format(dateRange.end, "yyyy-MM-dd"));
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    setFirstMonth((prev) => subMonths(prev, 1));
    setSecondMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setFirstMonth((prev) => addMonths(prev, 1));
    setSecondMonth((prev) => addMonths(prev, 1));
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isDateInRange = (date: Date) => {
    if (!dateRange.start || !dateRange.end) return false;
    return isWithinInterval(date, { start: dateRange.start, end: dateRange.end });
  };

  const isStartDate = (date: Date) => dateRange.start && isSameDay(date, dateRange.start);
  const isEndDate = (date: Date) => dateRange.end && isSameDay(date, dateRange.end);

  const renderCalendar = (month: Date) => {
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(month),
      end: endOfMonth(month),
    });

    const firstDayOfMonth = startOfMonth(month);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const previousMonthDays = Array.from({ length: startingDayOfWeek }, (_, i) => {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - (startingDayOfWeek - i));
      return date;
    });

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {previousMonthDays.map((date, i) => (
            <button key={`prev-${i}`} disabled className="h-8 rounded text-sm text-gray-300 bg-muted/50 cursor-not-allowed">
              {format(date, "d")}
            </button>
          ))}

          {daysInMonth.map((date) => {
            const isCurrent = isSameMonth(date, month);
            const isDisabled = isDateDisabled(date);
            const isStart = isStartDate(date);
            const isEnd = isEndDate(date);
            const inRange = isDateInRange(date);

            return (
              <button
                key={format(date, "yyyy-MM-dd")}
                onClick={() => handleDateClick(date)}
                disabled={isDisabled}
                className={`h-8 rounded text-sm font-medium transition-colors ${
                  isDisabled
                    ? "text-gray-300 bg-muted/50 cursor-not-allowed"
                    : isStart || isEnd
                    ? "bg-brand-500 text-gray-50"
                    : inRange && isCurrent
                    ? "bg-brand-50 text-accent-foreground"
                    : isCurrent
                    ? "hover:bg-muted text-foreground"
                    : "text-red-500"
                }`}
              >
                {format(date, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className="justify-start ">
        <Button variant={"outline"} className="flex items-center gap-2 px-4 py-2  rounded-lg  hover:bg-accent/50 transition-colors w-full ">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {mode === "single"
              ? dateRange.start
                ? format(dateRange.start, "d MMM yyyy")
                : "Select date"
              : dateRange.start && dateRange.end
              ? `${format(dateRange.start, "d MMM yyyy")} - ${format(dateRange.end, "d MMM yyyy")}`
              : dateRange.start
              ? `${format(dateRange.start, "d MMM yyyy")} - Select end date`
              : "Select date range"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-50 border-brand-50" align="start">
        <div className="p-4 bg-card">
          {notification.show && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{notification.message}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold flex-1 text-center">
              {mode === "single" ? format(firstMonth, "MMMM yyyy") : `${format(firstMonth, "MMMM yyyy")} - ${format(secondMonth, "MMMM yyyy")}`}
            </h2>
            <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {mode === "single" ? (
            <div>{renderCalendar(firstMonth)}</div>
          ) : (
            <div className="flex gap-4">
              <div>{renderCalendar(firstMonth)}</div>
              <div>{renderCalendar(secondMonth)}</div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="px-4 py-2">
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={mode === "range" ? !dateRange.start || !dateRange.end : !dateRange.start} className="px-4 py-2">
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
