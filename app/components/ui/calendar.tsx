"use client";

import * as React from "react";
import { cn } from "./utils";

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
        className
      )}
      {...props}
    />
  );
}

export { Calendar };
