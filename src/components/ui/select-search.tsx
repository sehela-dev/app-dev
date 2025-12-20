"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SelectSearchOption {
  value: string;
  label: string;
}

interface SelectSearchProps {
  options: SelectSearchOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  debounceMs?: number;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  loading?: boolean;
  loadingMessage?: string;
}

export function SelectSearch({
  options,
  value,
  onValueChange,
  searchValue,
  onSearchChange,
  debounceMs = 300,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  clearable = false,
  loading = false,
  loadingMessage = "Loading...",
}: SelectSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [internalSearch, setInternalSearch] = React.useState(searchValue || "");

  React.useEffect(() => {
    if (onSearchChange && internalSearch !== searchValue) {
      const timer = setTimeout(() => {
        onSearchChange(internalSearch);
      }, debounceMs);

      return () => clearTimeout(timer);
    }
  }, [internalSearch, debounceMs, onSearchChange, searchValue]);

  React.useEffect(() => {
    if (searchValue !== undefined) {
      setInternalSearch(searchValue);
    }
  }, [searchValue]);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    onValueChange?.(newValue);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between border-gray-200 shadow-sm", !value && "text-muted-foreground", className)}
          disabled={disabled || loading}
        >
          <span className="truncate text-gray-300">{loading ? loadingMessage : selectedOption ? selectedOption.label : placeholder}</span>
          <div className="flex items-center gap-1">
            {clearable && value && !loading && <X className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100" onClick={handleClear} />}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0 border-brand-50">
        <Command className="bg-gray-50 border-brand-50">
          <CommandInput placeholder={searchPlaceholder} value={internalSearch} onValueChange={setInternalSearch} />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onValueChange?.(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
