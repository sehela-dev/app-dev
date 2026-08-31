"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Gem, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MainFooterComponent } from "@/components/layout";
import { SessionCardComponent } from "@/components/general/session-card";
import { SessionFilters } from "@/components/general/session-filters";
import { InfiniteScroll } from "@/components/base/infinite-scroll";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";

import { useDebounce } from "@/hooks";
import { useGetPublicClasses, useGetPublicSessionsInfinite } from "@/hooks/api/queries/customer/public";
import { formatDateHelper } from "@/lib/helper";
import { getClassImage } from "@/utils/class-image";
import { IPublicClass } from "@/types/customer-app/public.interface";

export const BookClassView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const classId = searchParams.get("class_id") ?? undefined;
  const date = searchParams.get("date") ?? undefined;
  const instructorId = searchParams.get("instructor_id") ?? undefined;
  const locationId = searchParams.get("location_id") ?? undefined;
  const place = searchParams.get("place") ?? undefined;

  const { data: classesData, isLoading: classesLoading, isError: classesError } = useGetPublicClasses({ page_size: 100 });
  const classes = classesData?.data ?? [];

  const selectedClass = classes.find((c) => c.id === classId);

  useEffect(() => {
    document.querySelector("main")?.scrollTo({ top: 0 });
  }, [classId]);

  const setParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const onBackToClasses = () => setParams({ class_id: undefined });

  const onClearFilters = () => setParams({ date: undefined, instructor_id: undefined, location_id: undefined, place: undefined });

  return (
    <div className="flex flex-col w-full gap-8 font-serif mx-auto pt-8 min-h-dvh text-brand-500 justify-between">
      {!classId ? (
        <ClassPicker classes={classes} isLoading={classesLoading} isError={classesError} onSelect={(id) => setParams({ class_id: id })} />
      ) : (
        <ClassSessions
          classInfo={selectedClass}
          date={date}
          instructorId={instructorId}
          locationId={locationId}
          place={place}
          onBackToClasses={onBackToClasses}
          onDateChange={(d) => setParams({ date: date === d ? undefined : d })}
          onApplyFilters={(key, value) => setParams({ [key]: value })}
          onClearFilters={onClearFilters}
        />
      )}
      <MainFooterComponent />
    </div>
  );
};

// ----------------------------------------------------------------------
// Step 1 — choose a class type
// ----------------------------------------------------------------------

const ClassPicker = ({
  classes,
  isLoading,
  isError,
  onSelect,
}: {
  classes: IPublicClass[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (id: string) => void;
}) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.class_name.toLowerCase().includes(q) || (c.class_description ?? "").toLowerCase().includes(q));
  }, [classes, debouncedSearch]);

  return (
    <div className="flex w-full px-6 flex-col gap-8 h-full">
      <button onClick={handleBack} className="flex items-center gap-2 text-sm font-semibold w-fit cursor-pointer hover:opacity-70">
        <ChevronLeft size={18} /> Back
      </button>

      <h2 className="text-brand-500 font-extrabold text-[32px]">Book Class</h2>

      <div className="flex flex-col gap-2.5 leading-[130%]">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-brand-500/70 py-10">Something went wrong while loading classes. Please try again later.</p>
        ) : (
          <>
            <SearchInput search={search} onSearch={setSearch} placeholder="Search class..." className="min-h-[40px]" />
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-brand-500/70 py-10">No classes found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filtered.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => onSelect(cls.id)}
                    className="group flex w-full flex-row items-center justify-between gap-4 rounded-xl border border-brand-100 bg-gray-50 px-5 py-4 text-left transition-all duration-300 hover:border-brand-500 hover:bg-brand-500 hover:text-gray-50 cursor-pointer"
                  >
                    <div className="flex flex-col gap-1.5">
                      <p className="font-extrabold text-lg leading-tight">{cls.class_name}</p>
                      {cls.class_description && <p className="text-sm font-normal opacity-70 line-clamp-2">{cls.class_description}</p>}
                      {cls.allow_credit && (
                        <p className="flex items-center gap-1.5 text-xs font-semibold opacity-70">
                          <Gem size={14} /> Credit can be used
                        </p>
                      )}
                    </div>
                    <ChevronRight className="shrink-0 opacity-40 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Step 2 — choose a session (single page, driven by URL params)
// ----------------------------------------------------------------------

const ClassSessions = ({
  classInfo,
  date,
  instructorId,
  locationId,
  place,
  onBackToClasses,
  onDateChange,
  onApplyFilters,
  onClearFilters,
}: {
  classInfo?: IPublicClass;
  date?: string;
  instructorId?: string;
  locationId?: string;
  place?: string;
  onBackToClasses: () => void;
  onDateChange: (date: string) => void;
  onApplyFilters: (key: "instructor_id" | "location_id" | "place", value?: string) => void;
  onClearFilters: () => void;
}) => {
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetPublicSessionsInfinite(
    {
      date,
      class_id: classInfo?.id,
      instructor_id: instructorId,
      location_id: locationId,
      place,
    },
    4,
  );

  const sessions = useMemo(() => {
    const raw = data?.pages.flatMap((page) => page.data?.[0]?.sessions ?? []) ?? [];
    const byId = new Map<string, (typeof raw)[number]>();
    for (const s of raw) if (!byId.has(s.id)) byId.set(s.id, s);
    return [...byId.values()];
  }, [data]);
  const displayDate = data?.pages?.[0]?.data?.[0]?.date ?? date;

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter(
      (session) =>
        session.session_name.toLowerCase().includes(query) ||
        session.instructor_name?.toLowerCase().includes(query) ||
        session.location_name?.toLowerCase().includes(query),
    );
  }, [sessions, search]);

  const handleResetFilters = () => {
    setFilterResetKey((key) => key + 1);
    setSearch("");
    onClearFilters();
  };

  return (
    <div className="flex w-full px-6 flex-col gap-8 h-full">
      {/* back */}
      <button onClick={onBackToClasses} className="flex items-center gap-2 text-sm font-semibold w-fit cursor-pointer hover:opacity-70">
        <ChevronLeft size={18} /> All Classes
      </button>

      {/* class banner */}
      {/* <div className="relative w-full h-full mx-auto">
        <Image
          src={getClassImage(classInfo?.class_name)}
          alt={classInfo?.class_name ?? "class"}
          width={361}
          height={225}
          className="w-full h-full rounded-xl"
          objectFit="fill"
        />
      </div> */}

      <div className="flex flex-col gap-2">
        <h2 className="font-serif font-extrabold text-[32px] leading-[110%]">{classInfo?.class_name ?? "Class"}</h2>
        {classInfo?.class_description && <p className="font-normal">{classInfo.class_description}</p>}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-extrabold">Upcoming Sessions</h3>

        <SessionFilters
          key={filterResetKey}
          date={date}
          instructorId={instructorId}
          locationId={locationId}
          place={place}
          onDateChange={onDateChange}
          onChange={onApplyFilters}
          onReset={handleResetFilters}
        />

        <SearchInput
          search={search}
          onSearch={setSearch}
          placeholder="Search sessions, instructors, locations..."
          className="[&>input]:bg-brand-00 [&>input]:rounded-xl [&>input]:border-brand-100"
        />

        {search.trim() && (
          <p className="text-sm text-brand-500/60">
            {filteredSessions.length} result{filteredSessions.length === 1 ? "" : "s"}
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <p className="text-sm text-brand-500/70">Something went wrong while loading sessions.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="font-semibold">No sessions available on this date</p>
            <p className="text-sm text-brand-500/70 mt-1">Try another date or adjust your filters.</p>
          </div>
        ) : search.trim() && filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="font-semibold">No matches found</p>
            <p className="text-sm text-brand-500/70 mt-1">Try a different keyword for your search.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="font-[600]">{formatDateHelper(displayDate ?? "", "EEEE, dd MMM yyyy")}</h3>
            <InfiniteScroll hasMore={!!hasNextPage} isLoading={isFetchingNextPage} onLoadMore={() => fetchNextPage()}>
              <div className="flex flex-col gap-4">
                {filteredSessions.map((session) => (
                  <SessionCardComponent
                    key={session.id}
                    time={session.time_start}
                    endTime={session.time_end}
                    title={session.session_name}
                    location={session.place === "online" ? "Online" : session.location_name ?? ""}
                    instructor={session.instructor_name ?? ""}
                    slot={String(session.slots_available)}
                    isSpecial={session.type === "special"}
                    isOnline={session.place === "online"}
                    credit={session.allow_credit && session.price_credit_amount ? String(session.price_credit_amount) : ""}
                    price={!session.is_credit_only && session.price_idr > 0 ? session.price_idr.toLocaleString("id-ID") : ""}
                    url={`/book/session/${session.id}?date=${displayDate}&class_id=${classInfo?.id}`}
                  />
                ))}
              </div>
            </InfiniteScroll>
          </div>
        )}
      </div>
    </div>
  );
};
