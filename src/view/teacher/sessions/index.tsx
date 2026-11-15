"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CustomPagination } from "@/components/general/pagination-component";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherSessions } from "@/hooks/api/queries/teacher/use-teacher";
import { formatDateHelper } from "@/lib/helper";
import type { ITeacherSession } from "@/types/teacher.interface";

const PAGE_SIZE = 20;
const SCOPE_KEY = "teacher.sessions.scope";

const placeLabel = (session: ITeacherSession) =>
  session.place === "online" ? "Online" : session.location || "Offline";

const typeLabel = (type: string) => type.charAt(0).toUpperCase() + type.slice(1);

function SessionRow({ session }: { session: ITeacherSession }) {
  return (
    <li>
      <Link
        href={`/teacher/sessions/${session.id}`}
        className="flex min-h-16 items-center justify-between gap-4 rounded-lg border border-brand-100 bg-white px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-00 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {formatDateHelper(session.start_datetime, "EEE, dd MMM yyyy")}
            <span className="ml-2 normal-case tracking-normal text-brand-700">
              {formatDateHelper(session.start_datetime, "HH:mm")} -{" "}
              {formatDateHelper(session.end_datetime, "HH:mm")}
            </span>
          </p>
          <p className="mt-1 truncate text-base font-bold text-brand-900">{session.session_name}</p>
          <p className="mt-0.5 truncate text-sm text-brand-700">
            {session.class_name ? `${session.class_name} · ` : ""}
            {placeLabel(session)} · {typeLabel(session.type)}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-brand-500" aria-hidden="true" />
      </Link>
    </li>
  );
}

export default function TeacherSessionsView() {
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useTeacherSessions(scope, page, PAGE_SIZE);

  useEffect(() => {
    try {
      const query = new URLSearchParams(window.location.search).get("scope");
      if (query === "past" || query === "upcoming") {
        setScope(query);
        sessionStorage.setItem(SCOPE_KEY, query);
        return;
      }
      const saved = sessionStorage.getItem(SCOPE_KEY);
      if (saved === "past") setScope("past");
    } catch {
      // storage unavailable: keep the default tab
    }
  }, []);

  const changeScope = (next: "upcoming" | "past") => {
    setScope(next);
    setPage(1);
    try {
      sessionStorage.setItem(SCOPE_KEY, next);
    } catch {
      // storage unavailable: the tab still works for this visit
    }
  };

  const sessions = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Sessions</h1>
          <p className="mt-1 text-sm text-brand-700">Your classes and the confirmed roster behind each one.</p>
        </div>
        <div className="flex gap-1" role="group" aria-label="Session period">
          {(["upcoming", "past"] as const).map((value) => (
            <Button
              key={value}
              variant={scope === value ? "default" : "outline"}
              className="min-h-11 capitalize"
              aria-pressed={scope === value}
              onClick={() => changeScope(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading sessions">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg bg-brand-50" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-brand-100 bg-white p-6 text-center">
            <p className="text-sm text-brand-700">Sessions could not be loaded.</p>
            <Button variant="outline" className="mt-3 min-h-11" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-brand-200 bg-white p-8 text-center">
            <p className="text-sm text-brand-700">
              {scope === "upcoming" ? "No upcoming sessions." : "No past sessions."}
            </p>
            <p className="mt-1 text-xs text-brand-500">
              {scope === "upcoming"
                ? "Sessions assigned to you from today onward appear here."
                : "Sessions before today appear here once they are on the schedule."}
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-2" aria-busy={isFetching}>
              {sessions.map((session) => <SessionRow key={session.id} session={session} />)}
            </ul>
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-4">
                <CustomPagination
                  currentPage={page}
                  totalItems={pagination.total_items}
                  limit={PAGE_SIZE}
                  hasNextPage={pagination.has_next}
                  hasPrevPage={pagination.has_prev}
                  onPageChange={setPage}
                  showTotal
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
