"use client";

import { useMemo, useState } from "react";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectSearch } from "@/components/ui/select-search";
import { DateRangePicker } from "@/components/base/date-range-picker";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import { useGetPublicInstructors, useGetPublicLocations } from "@/hooks/api/queries/customer/public";

interface IFilterValues {
  instructor_id?: string;
  location_id?: string;
  place?: string;
}

interface ISessionFiltersProps {
  date?: string;
  instructorId?: string;
  locationId?: string;
  place?: string;
  onDateChange: (date: string) => void;
  onChange: (filters: IFilterValues) => void;
  onReset: () => void;
}

const FORMATS = [
  { id: "", label: "All" },
  { id: "offline", label: "Offline" },
  { id: "online", label: "Online" },
];

export function SessionFilters({ date, instructorId, locationId, place, onDateChange, onChange, onReset }: ISessionFiltersProps) {
  const [open, setOpen] = useState(true);
  const { data: instructorsData, isLoading: instructorsLoading } = useGetPublicInstructors({ page_size: 100 });
  const { data: locationsData, isLoading: locationsLoading } = useGetPublicLocations({ page_size: 100 });

  const instructorOptions = useMemo(
    () => (instructorsData?.data ?? []).map((item) => ({ value: item.id, label: item.full_name })),
    [instructorsData],
  );
  const locationOptions = useMemo(() => (locationsData?.data ?? []).map((item) => ({ value: item.id, label: item.name })), [locationsData]);

  const activeCount = [date, instructorId, locationId, place].filter(Boolean).length;

  return (
    <div className="w-full rounded-xl border border-brand-100 bg-brand-25 font-serif text-brand-500">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button type="button" className="flex items-center gap-2 cursor-pointer group">
                <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
                <p className="text-sm font-extrabold">Filters</p>
                {activeCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-gray-50">
                    {activeCount}
                  </span>
                )}
              </button>
            </CollapsibleTrigger>
            {activeCount > 0 && (
              <button type="button" onClick={onReset} className="text-xs font-semibold underline cursor-pointer hover:opacity-70">
                Reset
              </button>
            )}
          </div>

          <CollapsibleContent className="pt-4">
            <div className="flex flex-col gap-4">
              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-500/60">Date</p>
                <DateRangePicker
                  mode="single"
                  startDate={date}
                  allowPastDates={false}
                  allowFutureDates
                  onDateRangeChange={(selectedDate) => selectedDate && onDateChange(selectedDate)}
                />
              </div>

              {/* Format */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-500/60">Format</p>
                <div className="flex items-center gap-2">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => onChange({ place: fmt.id || undefined })}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer",
                        (place ?? "") === fmt.id
                          ? "bg-brand-500 border-brand-500 text-gray-50"
                          : "bg-transparent border-brand-100 text-brand-500 hover:border-brand-500",
                      )}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructor & Location */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-500/60">Instructor & Location</p>
                <div className="flex flex-col gap-2.5">
                  <SelectSearch
                    options={instructorOptions}
                    value={instructorId}
                    onValueChange={(value) => onChange({ instructor_id: value || undefined })}
                    placeholder="Instructor"
                    searchPlaceholder="Search instructor..."
                    emptyMessage="No instructor found."
                    loading={instructorsLoading}
                    loadingMessage="Loading instructors..."
                    clearable
                    className="[&>span]:text-brand-500"
                  />
                  <SelectSearch
                    options={locationOptions}
                    value={locationId}
                    onValueChange={(value) => onChange({ location_id: value || undefined })}
                    placeholder="Location"
                    searchPlaceholder="Search location..."
                    emptyMessage="No location found."
                    loading={locationsLoading}
                    loadingMessage="Loading locations..."
                    clearable
                    className="[&>span]:text-brand-500"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}