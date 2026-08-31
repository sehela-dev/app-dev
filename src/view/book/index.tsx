"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addDays, differenceInDays, format, parseISO, startOfDay } from "date-fns";

import { MainFooterComponent } from "@/components/layout";
import { SessionCardComponent } from "@/components/general/session-card";
import { SessionFilters } from "@/components/general/session-filters";
import { InfiniteScroll } from "@/components/base/infinite-scroll";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useGetPublicSessionsInfinite } from "@/hooks/api/queries/customer/public";
import { formatDateHelper } from "@/lib/helper";

const DATE_RANGE_DAYS = 7; // today + 7 days forward

function getTodayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

function SessionDateStrip({ selectedDate, onSelect }: { selectedDate?: string; onSelect: (d: string) => void }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  // clamp only past — future extends
  const effectiveSelected = useMemo(() => {
    if (!selectedDate) return todayStr;
    try {
      const parsed = parseISO(selectedDate);
      if (Number.isNaN(parsed.getTime())) return todayStr;
      const d = startOfDay(parsed);
      if (d < today) return todayStr;
      return format(d, "yyyy-MM-dd");
    } catch {
      return todayStr;
    }
  }, [selectedDate, today, todayStr]);

  // keep extending: show from today to max(today+7, selected+7)
  const dates = useMemo(() => {
    const selected = parseISO(effectiveSelected);
    const endFromSelected = addDays(startOfDay(selected), DATE_RANGE_DAYS);
    const defaultEnd = addDays(today, DATE_RANGE_DAYS);
    const end = endFromSelected > defaultEnd ? endFromSelected : defaultEnd;
    const len = differenceInDays(end, today) + 1;
    return Array.from({ length: len }, (_, i) => addDays(today, i));
  }, [today, effectiveSelected]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const otherDates = useMemo(() => dates.slice(1), [dates]);
  const isTodaySelected = effectiveSelected === todayStr;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [otherDates.length]);

  // keep selected in view; when today selected scroll back to first date after today
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isTodaySelected) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    const idx = otherDates.findIndex((d) => format(d, "yyyy-MM-dd") === effectiveSelected);
    if (idx >= 0) {
      const child = el.children[idx] as HTMLElement | undefined;
      child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [effectiveSelected, otherDates, isTodaySelected]);

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  const todayDate = dates[0];

  return (
    <div className="flex gap-2 w-full items-stretch">
      {/* Today pinned — always visible */}
      <button
        type="button"
        onClick={() => onSelect(todayStr)}
        className={cn(
          "flex min-w-[72px] h-[90px] flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-colors shrink-0 cursor-pointer snap-start shadow-sm",
          isTodaySelected ? "bg-brand-500 border-brand-500 text-gray-50" : "bg-brand-25 border-brand-100 text-brand-500 hover:border-brand-500",
        )}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">{format(todayDate, "EEE")}</span>
        <span className="text-xl font-extrabold leading-none mt-1">{format(todayDate, "d")}</span>
        <span className="text-xs font-semibold opacity-70 mt-0.5">{format(todayDate, "MMM")}</span>
        <span className="mt-1 text-[10px] font-bold opacity-80 h-[14px] leading-[14px]">Today</span>
      </button>

      <div className="relative flex-1 min-w-0">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {otherDates.map((d) => {
            const dateStr = format(d, "yyyy-MM-dd");
            const isSelected = dateStr === effectiveSelected;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelect(dateStr)}
                className={cn(
                  "flex min-w-[72px] h-[90px] flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-colors shrink-0 cursor-pointer snap-start",
                  isSelected ? "bg-brand-500 border-brand-500 text-gray-50" : "bg-brand-25 border-brand-100 text-brand-500 hover:border-brand-500",
                )}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">{format(d, "EEE")}</span>
                <span className="text-xl font-extrabold leading-none mt-1">{format(d, "d")}</span>
                <span className="text-xs font-semibold opacity-70 mt-0.5">{format(d, "MMM")}</span>
                <span className="mt-1 text-[10px] font-bold h-[14px] leading-[14px] opacity-80">{isSelected ? "Selected" : "\u00A0"}</span>
              </button>
            );
          })}
        </div>

        {canPrev && (
          <button
            type="button"
            aria-label="Previous dates"
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 size-8 rounded-full border border-brand-100 bg-gray-50 shadow-md flex items-center justify-center text-brand-500 hover:bg-brand-500 hover:text-gray-50 hover:border-brand-500 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canNext && (
          <button
            type="button"
            aria-label="Next dates"
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 size-8 rounded-full border border-brand-100 bg-gray-50 shadow-md flex items-center justify-center text-brand-500 hover:bg-brand-500 hover:text-gray-50 hover:border-brand-500 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export const BookClassView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const classId = searchParams.get("class_id") ?? undefined;
  const dateParam = searchParams.get("date") ?? undefined;
  const instructorId = searchParams.get("instructor_id") ?? undefined;
  const locationId = searchParams.get("location_id") ?? undefined;
  const place = searchParams.get("place") ?? undefined;

  // default to today if no date in URL — calendar always has a selected date, only past is blocked, future extends
  const todayStr = useMemo(() => getTodayStr(), []);
  const effectiveDate = useMemo(() => {
    if (!dateParam) return todayStr;
    try {
      const parsed = parseISO(dateParam);
      if (Number.isNaN(parsed.getTime())) return todayStr;
      const today = startOfDay(new Date());
      const d = startOfDay(parsed);
      if (d < today) return todayStr;
      return format(d, "yyyy-MM-dd");
    } catch {
      return todayStr;
    }
  }, [dateParam, todayStr]);

  const [filterResetKey, setFilterResetKey] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetPublicSessionsInfinite(
    {
      date: effectiveDate,
      class_id: classId,
      instructor_id: instructorId,
      location_id: locationId,
      place,
    },
    50,
  );

  const sessions = useMemo(() => data?.pages.flatMap((page) => page.data?.[0]?.sessions ?? []) ?? [], [data]);
  const displayDate = data?.pages?.[0]?.data?.[0]?.date ?? effectiveDate;

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter(
      (session) =>
        session.session_name.toLowerCase().includes(query) ||
        session.instructor_name?.toLowerCase().includes(query) ||
        session.location_name?.toLowerCase().includes(query) ||
        session.class_name?.toLowerCase().includes(query),
    );
  }, [sessions, search]);

  const setParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  const handleResetFilters = () => {
    setFilterResetKey((key) => key + 1);
    setSearch("");
    setParams({ class_id: undefined, instructor_id: undefined, location_id: undefined, place: undefined });
  };

  return (
    <div className="flex flex-col w-full gap-8 font-serif mx-auto pt-8 min-h-dvh text-brand-500 justify-between">
      <div className="flex w-full px-6 flex-col gap-8 h-full">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm font-semibold w-fit cursor-pointer hover:opacity-70">
          <ChevronLeft size={18} /> Back
        </button>

        <h2 className="font-serif font-extrabold text-[32px] leading-[110%]">Book Class</h2>

        {/* Calendar on top — today to 7 days forward, no past */}
        <SessionDateStrip selectedDate={effectiveDate} onSelect={(d) => setParams({ date: d })} />

        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-extrabold">Upcoming Sessions</h3>

          <SessionFilters
            key={filterResetKey}
            classId={classId}
            instructorId={instructorId}
            locationId={locationId}
            place={place}
            onChange={(key, value) => setParams({ [key]: value })}
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
              <p className="font-semibold">No sessions available</p>
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
                      url={`/book/session/${session.id}?date=${displayDate}${classId ? `&class_id=${classId}` : ""}`}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            </div>
          )}
        </div>
      </div>
      <MainFooterComponent />
    </div>
  );
};
