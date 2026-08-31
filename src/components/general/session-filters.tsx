"use client";

import { useMemo, useState } from "react";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectSearch } from "@/components/ui/select-search";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import { useGetPublicClasses, useGetPublicInstructors, useGetPublicLocations } from "@/hooks/api/queries/customer/public";

interface IFilterValues {
  class_id?: string;
  instructor_id?: string;
  location_id?: string;
  place?: string;
}

type FilterKey = keyof IFilterValues;

interface ISessionFiltersProps {
  classId?: string;
  instructorId?: string;
  locationId?: string;
  place?: string;
  onChange: (key: FilterKey, value: string | undefined) => void;
  onReset: () => void;
}

const FORMATS = [
  { id: "", label: "All" },
  { id: "offline", label: "Offline" },
  { id: "online", label: "Online" },
];

export function SessionFilters({ classId, instructorId, locationId, place, onChange, onReset }: ISessionFiltersProps) {
  const [open, setOpen] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const { data: classesData, isLoading: classesLoading, isFetching: classesFetching } = useGetPublicClasses({ page_size: 100 });
  const {
    data: instructorsData,
    isLoading: instructorsLoading,
    isFetching: instructorsFetching,
  } = useGetPublicInstructors({ page_size: 15, q: instructorSearch.trim() || undefined });
  const {
    data: locationsData,
    isLoading: locationsLoading,
    isFetching: locationsFetching,
  } = useGetPublicLocations({ page_size: 15, q: locationSearch.trim() || undefined });

  const classOptions = useMemo(() => {
    const q = classSearch.trim().toLowerCase();
    const all = (classesData?.data ?? []).map((item) => ({ value: item.id, label: item.class_name }));
    if (!q) return all;
    return all.filter((o) => o.label.toLowerCase().includes(q));
  }, [classesData, classSearch]);
  const instructorOptions = useMemo(
    () => (instructorsData?.data ?? []).map((item) => ({ value: item.id, label: item.full_name })),
    [instructorsData],
  );
  const locationOptions = useMemo(() => (locationsData?.data ?? []).map((item) => ({ value: item.id, label: item.name })), [locationsData]);

  const activeCount = [classId, instructorId, locationId, place].filter(Boolean).length;

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
              {/* Format */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-500/60">Format</p>
                <div className="flex items-center gap-2">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => onChange("place", fmt.id || undefined)}
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

              {/* Class */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-500/60">Class</p>
                <SelectSearch
                  options={classOptions}
                  value={classId}
                  onValueChange={(value) => onChange("class_id", value || undefined)}
                  searchValue={classSearch}
                  onSearchChange={setClassSearch}
                  placeholder="All Classes"
                  searchPlaceholder="Search class..."
                  emptyMessage="No class found."
                  loading={classesLoading || classesFetching}
                  loadingMessage="Loading classes..."
                  clearable
                  className="[&>span]:text-brand-500"
                />
              </div>

              {/* Instructor & Location */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-500/60">Instructor & Location</p>
                <div className="flex flex-col gap-2.5">
                  <SelectSearch
                    options={instructorOptions}
                    value={instructorId}
                    onValueChange={(value) => onChange("instructor_id", value || undefined)}
                    searchValue={instructorSearch}
                    onSearchChange={setInstructorSearch}
                    placeholder="Instructor"
                    searchPlaceholder="Search instructor..."
                    emptyMessage="No instructor found."
                    loading={instructorsLoading || instructorsFetching}
                    loadingMessage="Loading instructors..."
                    clearable
                    className="[&>span]:text-brand-500"
                  />
                  <SelectSearch
                    options={locationOptions}
                    value={locationId}
                    onValueChange={(value) => onChange("location_id", value || undefined)}
                    searchValue={locationSearch}
                    onSearchChange={setLocationSearch}
                    placeholder="Location"
                    searchPlaceholder="Search location..."
                    emptyMessage="No location found."
                    loading={locationsLoading || locationsFetching}
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