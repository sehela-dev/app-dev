"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllTeacherSessions, useTeacherEarnings, useTeacherInvoices } from "@/hooks/api/queries/teacher/use-teacher";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { currentPeriod, pad, periodBounds, periodLabel, periodMonthLabel, periodOptions, previousPeriod } from "@/view/teacher/period";
import { PeriodFilter } from "@/view/teacher/period-filter";
import type { ITeacherInvoice } from "@/types/teacher.interface";
import {
  attendanceTotals,
  classBreakdown,
  distinctClasses,
  fillRate,
  hasNoActivity,
  noShowRate,
  percentChange,
  periodsEndingAt,
  sumHours,
  taughtSessions,
  trendPoints,
  upcomingWithin,
  type TeachingSession,
} from "./summary";

const formatHours = (hours: number) => `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;

const formatPercent = (ratio: number | null) => (ratio === null ? "-" : `${Math.round(ratio * 100)}%`);

const invoicePeriod = (invoice: ITeacherInvoice) => `${invoice.report_year}-${pad(invoice.report_month)}`;

function SectionHeader({ title, note, href, linkLabel }: { title: string; note: string; href: string; linkLabel: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 className="text-lg font-bold text-brand-900">{title}</h2>
        <p className="mt-0.5 text-sm text-brand-700">{note}</p>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-600 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

export default function TeacherOverviewView() {
  // Resolve WIB today after mount so prerender and hydration agree.
  const [period, setPeriod] = useState("");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("period");
    const current = currentPeriod();
    setPeriod(requested && /^\d{4}-\d{2}$/.test(requested) && requested <= current ? requested : current);
  }, []);

  const changePeriod = (next: string) => {
    setPeriod(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("period", next);
      window.history.replaceState({}, "", url);
    } catch {
      // history unavailable: the in-memory selection still works
    }
  };

  const earningsQuery = useTeacherEarnings(period);
  const previousQuery = useTeacherEarnings(period ? previousPeriod(period) : "");
  const invoicesQuery = useTeacherInvoices();
  const pastQuery = useAllTeacherSessions("past");
  const upcomingQuery = useAllTeacherSessions("upcoming");

  const earnings = earningsQuery.data?.data;
  const previous = previousQuery.data?.data;
  // keepPreviousData can leave the old period on screen while the new key loads.
  const earningsReady = Boolean(earnings && earnings.period === period);
  const previousReady = Boolean(previous && previous.period === previousPeriod(period));

  const isLoading =
    !period || !earningsReady || !previousReady || earningsQuery.isLoading || previousQuery.isLoading || invoicesQuery.isLoading ||
    pastQuery.isLoading || upcomingQuery.isLoading;
  const isError = earningsQuery.isError || previousQuery.isError || invoicesQuery.isError || pastQuery.isError || upcomingQuery.isError;

  const retry = () => {
    void Promise.all([earningsQuery.refetch(), previousQuery.refetch(), invoicesQuery.refetch(), pastQuery.refetch(), upcomingQuery.refetch()]);
  };

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading overview">
        <Skeleton className="h-10 w-56 bg-brand-50" />
        <Skeleton className="h-44 w-full bg-brand-50" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-40 w-full bg-brand-50" />
          <Skeleton className="h-40 w-full bg-brand-50" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-brand-100 bg-white p-6 text-center">
        <h1 className="text-lg font-bold text-brand-900">Overview could not be loaded</h1>
        <p className="mt-1 text-sm text-brand-700">Check your connection and try again.</p>
        <Button variant="outline" className="mt-3 min-h-11" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  const invoices = invoicesQuery.data?.data ?? [];
  const pastSessions = pastQuery.data ?? [];
  const upcomingSessions = upcomingQuery.data ?? [];

  if (!earnings) return null;
  const bounds = periodBounds(period);
  const nowIso = new Date().toISOString();
  const isCurrentPeriod = period === currentPeriod();
  const taught = taughtSessions(pastSessions as TeachingSession[], nowIso, bounds.start, bounds.end);
  const nextSevenDays = isCurrentPeriod ? upcomingWithin(upcomingSessions as TeachingSession[], nowIso, 7) : [];
  const attendance = attendanceTotals(taught);
  const fill = fillRate(attendance.booked, attendance.capacity);
  const noShow = noShowRate(attendance.attended, attendance.no_show);
  const classes = classBreakdown(taught, earnings.sessions);
  const trend = trendPoints(periodsEndingAt(period, 12), invoices, period, earnings.total_payment, earnings.provisional);
  const currentInvoice = invoices.find((invoice) => invoicePeriod(invoice) === period);
  const change = previous ? percentChange(earnings.total_payment, previous.total_payment) : null;
  const previousLabel = periodLabel(previousPeriod(period));
  const periodChoices = periodOptions();
  if (period && !periodChoices.includes(period)) periodChoices.unshift(period);
  const noActivity = hasNoActivity(pastSessions.length, upcomingSessions.length, invoices.length);

  if (noActivity) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Overview</h1>
        <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-white p-8 text-center">
          <h2 className="text-lg font-bold text-brand-900">No activity yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-700">
            When the studio schedules your sessions or issues an invoice, your summary appears here.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/teacher/sessions"
              className="inline-flex min-h-11 items-center rounded-md border border-brand-100 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Sessions
            </Link>
            <Link
              href="/teacher/invoices"
              className="inline-flex min-h-11 items-center rounded-md border border-brand-100 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const maxTrend = Math.max(...trend.map((point) => point.total ?? 0), 1);

  let periodStatus = "The studio has not issued an invoice for this period yet.";
  if (currentInvoice?.status === "paid") {
    periodStatus = `Paid ${formatDateHelper(currentInvoice.paid_at ?? "", "dd MMM yyyy")}${
      currentInvoice.paid_reference ? ` · Ref: ${currentInvoice.paid_reference}` : ""
    }`;
  } else if (currentInvoice) {
    periodStatus = "Invoiced, not paid yet.";
  }

  return (
    <div>
      <div className="flex flex-row w-full justify-between">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">Overview</h1>
            <p className="mt-1 text-sm text-brand-700">The selected pay period and the 12 periods ending there. Read-only.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <p className="text-sm font-semibold text-brand-600">
              {periodMonthLabel(period)} · {formatDateHelper(bounds.start, "dd MMM")} to {formatDateHelper(bounds.end, "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <div>
          <PeriodFilter id="overview-period" value={period} options={periodChoices} onChange={changePeriod} />
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-brand-100 bg-white p-5" aria-label={isCurrentPeriod ? "This period" : "Selected period"}>
          <SectionHeader
            title={isCurrentPeriod ? "This period" : "Selected period"}
            note="Invoiced total wins over the live estimate."
            href={`/teacher/earnings?period=${period}`}
            linkLabel="Open earnings"
          />
          <div className="mt-4">
            {earnings.source === "invoice" ? (
              <p className="text-3xl font-bold tabular-nums tracking-tight text-brand-900 sm:text-4xl">{formatCurrency(earnings.total_payment)}</p>
            ) : (
              <p className="text-2xl font-bold text-brand-900">Not invoiced yet</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge
                className={earnings.source === "invoice" ? "border-brand-500 bg-brand-500 text-white" : "border-brand-200 bg-brand-50 text-brand-800"}
              >
                {earnings.source === "invoice" ? "Invoice total" : "Estimate"}
              </Badge>
              {earnings.source === "cache" && (
                <p className="text-sm text-brand-700">
                  Live estimate: <span className="text-lg font-bold tabular-nums text-brand-900">{formatCurrency(earnings.total_payment)}</span>
                </p>
              )}
            </div>
            <p className="mt-2 text-sm text-brand-700">{periodStatus}</p>
          </div>
          <p className="mt-3 text-sm text-brand-700">
            {change === null
              ? `No previous period total to compare with ${previousLabel}.`
              : `${change > 0 ? "+" : ""}${change}% vs ${previousLabel}${previous?.source === "cache" ? " (estimate)" : ""}`}
          </p>
          {earnings.provisional && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              This period is still open until 23:59 WIB on {formatDateHelper(bounds.end, "dd MMM yyyy")}. The figure can still change.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-brand-100 bg-white p-5" aria-label="Teaching load">
          <SectionHeader
            title="Teaching load"
            note={
              isCurrentPeriod
                ? "Sessions and hours already taught this period, plus the next 7 days."
                : "Sessions and hours already taught in the selected period."
            }
            href="/teacher/sessions?scope=past"
            linkLabel="Open sessions"
          />
          <dl className={cn("mt-4 grid gap-4", isCurrentPeriod ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
            <div>
              <dt className="text-xs font-semibold text-brand-600">Sessions taught</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-brand-900">{taught.length}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-brand-600">Hours taught</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-brand-900">{formatHours(sumHours(taught))}</dd>
            </div>
            {isCurrentPeriod && (
              <div>
                <dt className="text-xs font-semibold text-brand-600">Next 7 days</dt>
                <dd className="mt-1 text-base font-semibold text-brand-900">
                  {nextSevenDays.length} session{nextSevenDays.length === 1 ? "" : "s"} · {distinctClasses(nextSevenDays)} class
                  {distinctClasses(nextSevenDays) === 1 ? "" : "es"}
                </dd>
              </div>
            )}
          </dl>
          {taught.length === 0 && <p className="mt-4 text-sm text-brand-700">No sessions taught in this period yet.</p>}
          {isCurrentPeriod && nextSevenDays.length === 0 && <p className="mt-1 text-sm text-brand-700">No sessions in the next 7 days.</p>}
          {isCurrentPeriod && (
            <Link
              href="/teacher/sessions?scope=upcoming"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-brand-600 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              See upcoming sessions
            </Link>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-brand-100 bg-white p-5" aria-label="Last 12 periods">
        <SectionHeader
          title="Last 12 periods"
          note="Issued invoice totals; the selected period uses its live estimate when no invoice exists."
          href="/teacher/invoices"
          linkLabel="Open invoices"
        />
        <div className="mt-5 flex h-44 items-stretch gap-1.5" role="list" aria-label="Period totals ending at the selected period">
          {trend.map((point) => {
            const height = point.total === null ? 2 : Math.max(4, Math.round((point.total / maxTrend) * 100));
            const isSelected = point.period === period;
            const isEstimate = point.total !== null && point.status === "none";
            const color =
              point.status === "paid" ? "bg-brand-700" : point.status === "invoiced" ? "bg-brand-300" : isEstimate ? "bg-brand-200" : "bg-brand-100";
            const ring = point.provisional ? "ring-2 ring-amber-300" : isSelected ? "ring-2 ring-brand-500" : "";
            return (
              <div
                key={point.period}
                role="listitem"
                className="flex min-w-0 flex-1 flex-col"
                aria-label={`${periodMonthLabel(point.period)}: ${point.total === null ? "no invoice" : formatCurrency(point.total)}${
                  point.provisional ? ", provisional" : ""
                }`}
              >
                <div className="flex flex-1 items-end">
                  <div className={cn("w-full rounded-t", color, ring)} style={{ height: `${height}%` }} />
                </div>
                <span className="mt-1 text-center text-[10px] text-brand-600">{periodLabel(point.period).split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-700" />
            Paid
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-300" />
            Invoiced
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-200" />
            Estimate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-100" />
            No invoice
          </span>
        </div>
        <p className="mt-2 text-xs text-brand-600">The ringed bar is the selected period; an amber ring means it is still provisional.</p>
      </section>

      <section className="mt-4 rounded-xl border border-brand-100 bg-white p-5" aria-label="Class health">
        <SectionHeader
          title="Class health"
          note="Fill and attendance for sessions already taught in the selected period."
          href="/teacher/sessions?scope=past"
          linkLabel="Open sessions"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-brand-600">Fill rate</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-brand-900">{formatPercent(fill)}</p>
            <p className="mt-1 text-sm text-brand-700">
              {attendance.booked} booked of {attendance.capacity} places
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-600">No-show rate</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-brand-900">{formatPercent(noShow)}</p>
            <p className="mt-1 text-sm text-brand-700">
              {attendance.no_show} no-shows of {attendance.attended + attendance.no_show} marked places
            </p>
          </div>
        </div>
        {classes.length === 0 ? (
          <p className="mt-4 text-sm text-brand-700">No taught sessions to score yet.</p>
        ) : (
          <ul className="mt-5 divide-y divide-brand-100 border-t border-brand-100">
            {classes.map((row) => (
              <li key={row.class_name} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 text-sm">
                <span className="font-semibold text-brand-900">{row.class_name}</span>
                <span className="text-brand-700">
                  {row.sessions} session{row.sessions === 1 ? "" : "s"} · {formatHours(row.hours)}
                </span>
                <span className="tabular-nums font-semibold text-brand-900">{formatCurrency(row.earnings)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
