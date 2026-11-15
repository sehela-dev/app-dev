"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { periodLabel } from "@/view/teacher/period";

export function PeriodFilter({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: string;
  options: string[];
  onChange: (period: string) => void;
}) {
  return (
    <div className="w-full sm:w-48">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-brand-600">
        Period
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="min-h-11 w-full bg-white">
          <SelectValue placeholder="Select a period" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>{periodLabel(option)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
