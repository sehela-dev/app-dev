"use client";

import type React from "react";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useState } from "react";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  search?: string;
  debounceMs?: number;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, search, onKeyDown, placeholder = "Search here...", debounceMs = 300, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(search || "");

    useEffect(() => {
      if (onSearch && internalValue !== search) {
        const timer = setTimeout(() => {
          onSearch(internalValue);
        }, debounceMs);

        return () => clearTimeout(timer);
      }
    }, [internalValue, debounceMs, onSearch, search]);

    useEffect(() => {
      if (search !== undefined) {
        setInternalValue(search);
      }
    }, [search]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(e.currentTarget.value);
      }
      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
    };

    return (
      <div className={cn("relative flex items-center w-full", className)}>
        <input
          type={"text"}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className,
          )}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          placeholder={placeholder}
          value={internalValue}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 p-1 text-gray-600 hover:text-gray-800 transition-colors"
          onClick={() => {
            const input = ref as React.RefObject<HTMLInputElement>;
            if (input.current && onSearch) {
              onSearch(input.current.value);
            }
          }}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
