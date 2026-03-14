"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

// ---------------------------------------------------------------------------
// DatePicker  (day + month + year — for Date of Birth style fields)
// ---------------------------------------------------------------------------

type DatePickerProps = {
  /** ISO date string "YYYY-MM-DD" or "" */
  value: string;
  onChange: (value: string) => void;
  /** Earliest year selectable (default: current year − 120) */
  minYear?: number;
  /** Latest year selectable (default: current year) */
  maxYear?: number;
  className?: string;
  disabled?: boolean;
};

function DatePicker({
  value,
  onChange,
  minYear,
  maxYear,
  className,
  disabled,
}: DatePickerProps) {
  const currentYear = new Date().getFullYear();
  const min = minYear ?? currentYear - 120;
  const max = maxYear ?? currentYear;

  // Parse controlled value
  const [y, m, d] = value ? value.split("-").map(Number) : [null, null, null];
  const selYear = y ?? null;
  const selMonth = m ?? null; // 1-based
  const selDay = d ?? null;

  // Keep local draft state so users can select day/month/year progressively.
  const [draftYear, setDraftYear] = React.useState<number | null>(selYear);
  const [draftMonth, setDraftMonth] = React.useState<number | null>(selMonth);
  const [draftDay, setDraftDay] = React.useState<number | null>(selDay);

  React.useEffect(() => {
    setDraftYear(selYear);
    setDraftMonth(selMonth);
    setDraftDay(selDay);
  }, [selYear, selMonth, selDay]);

  // How many days are valid for the current month/year selection
  const maxDay =
    draftMonth && draftYear ? daysInMonth(draftMonth, draftYear) : 31;

  const maybeEmit = (
    year: number | null,
    month: number | null,
    day: number | null,
  ) => {
    if (!year || !month || !day) {
      return;
    }
    // Clamp day to valid range for the chosen month/year
    const clampedDay = Math.min(day, daysInMonth(month, year));
    const pad = (n: number) => String(n).padStart(2, "0");
    onChange(`${year}-${pad(month)}-${pad(clampedDay)}`);
  };

  const stepYear = (delta: number) => {
    const next = Math.min(max, Math.max(min, (draftYear ?? max) + delta));
    setDraftYear(next);
    maybeEmit(next, draftMonth, draftDay);
  };

  // Build year list (newest first — most intuitive for DOB)
  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {/* Day */}
      <Select
        disabled={disabled}
        value={draftDay ? String(draftDay) : ""}
        onValueChange={(v) => {
          const nextDay = Number(v);
          setDraftDay(nextDay);
          maybeEmit(draftYear, draftMonth, nextDay);
        }}
      >
        <SelectTrigger className="w-[92px] h-10 text-sm">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((day) => (
            <SelectItem key={day} value={String(day)}>
              {String(day).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month */}
      <Select
        disabled={disabled}
        value={draftMonth ? String(draftMonth) : ""}
        onValueChange={(v) => {
          const nextMonth = Number(v);
          setDraftMonth(nextMonth);
          maybeEmit(draftYear, nextMonth, draftDay);
        }}
      >
        <SelectTrigger className="w-[130px] h-10 text-sm">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((name, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year with ← → arrow navigation */}
      <div className="flex items-center">
        <button
          type="button"
          disabled={disabled || (draftYear ?? max) <= min}
          onClick={() => stepYear(-1)}
          className={cn(
            "flex h-10 w-8 items-center justify-center rounded-l-md border border-r-0 border-input bg-input-background text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Previous year"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <Select
          disabled={disabled}
          value={draftYear ? String(draftYear) : ""}
          onValueChange={(v) => {
            const nextYear = Number(v);
            setDraftYear(nextYear);
            maybeEmit(nextYear, draftMonth, draftDay);
          }}
        >
          <SelectTrigger className="w-[118px] h-10 rounded-none border-x-0 text-sm focus-visible:z-10">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((yr) => (
              <SelectItem key={yr} value={String(yr)}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          disabled={disabled || (draftYear ?? min) >= max}
          onClick={() => stepYear(1)}
          className={cn(
            "flex h-10 w-8 items-center justify-center rounded-r-md border border-l-0 border-input bg-input-background text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Next year"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MonthYearPicker  (month + year — for "Artist Formed" / expiry-style fields)
// ---------------------------------------------------------------------------

type MonthYearPickerProps = {
  /** Value as "YYYY-MM" or "" */
  value: string;
  onChange: (value: string) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
  disabled?: boolean;
};

function MonthYearPicker({
  value,
  onChange,
  minYear,
  maxYear,
  className,
  disabled,
}: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear();
  const min = minYear ?? 1900;
  const max = maxYear ?? currentYear;

  const [rawYear, rawMonth] = value ? value.split("-").map(Number) : [null, null];
  const selYear = rawYear ?? null;
  const selMonth = rawMonth ?? null; // 1-based

  const [draftYear, setDraftYear] = React.useState<number | null>(selYear);
  const [draftMonth, setDraftMonth] = React.useState<number | null>(selMonth);

  React.useEffect(() => {
    setDraftYear(selYear);
    setDraftMonth(selMonth);
  }, [selYear, selMonth]);

  const maybeEmit = (year: number | null, month: number | null) => {
    if (!year || !month) {
      return;
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    onChange(`${year}-${pad(month)}`);
  };

  const stepYear = (delta: number) => {
    const next = Math.min(max, Math.max(min, (draftYear ?? max) + delta));
    setDraftYear(next);
    maybeEmit(next, draftMonth);
  };

  const years = Array.from({ length: max - min + 1 }, (_, i) => max - i);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {/* Month */}
      <Select
        disabled={disabled}
        value={draftMonth ? String(draftMonth) : ""}
        onValueChange={(v) => {
          const nextMonth = Number(v);
          setDraftMonth(nextMonth);
          maybeEmit(draftYear, nextMonth);
        }}
      >
        <SelectTrigger className="w-[130px] h-10 text-sm">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((name, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year with ← → arrow navigation */}
      <div className="flex items-center">
        <button
          type="button"
          disabled={disabled || (draftYear ?? max) <= min}
          onClick={() => stepYear(-1)}
          className={cn(
            "flex h-10 w-8 items-center justify-center rounded-l-md border border-r-0 border-input bg-input-background text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Previous year"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <Select
          disabled={disabled}
          value={draftYear ? String(draftYear) : ""}
          onValueChange={(v) => {
            const nextYear = Number(v);
            setDraftYear(nextYear);
            maybeEmit(nextYear, draftMonth);
          }}
        >
          <SelectTrigger className="w-[118px] h-10 rounded-none border-x-0 text-sm focus-visible:z-10">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((yr) => (
              <SelectItem key={yr} value={String(yr)}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          disabled={disabled || (draftYear ?? min) >= max}
          onClick={() => stepYear(1)}
          className={cn(
            "flex h-10 w-8 items-center justify-center rounded-r-md border border-l-0 border-input bg-input-background text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Next year"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legacy wrapper kept for any existing <Calendar /> usages
// ---------------------------------------------------------------------------

type CalendarProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <input
      type="date"
      className={cn(
        "px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, DatePicker, MonthYearPicker };
