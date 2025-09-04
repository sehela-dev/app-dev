"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CustomCheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function CustomCheckbox({ id, label, checked = false, onChange, className }: CustomCheckboxProps) {
  const handleChange = () => {
    onChange?.(!checked);
  };

  return (
    <div className={cn("flex items-center gap-3 font-serif", className)}>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={handleChange}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
          checked ? "bg-brand-500 border-brand-500 text-white" : "border-brand-500 bg-none hover:border-gray-600",
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>
      <label htmlFor={id} className="text-sm font-medium text-brand-500 cursor-pointer select-none" onClick={handleChange}>
        {label}
      </label>
    </div>
  );
}
