"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherEarnings } from "@/hooks/api/queries/teacher/use-teacher";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { currentPeriod, periodOptions } from "@/view/teacher/period";
import { PeriodFilter } from "@/view/teacher/period-filter";
import type { ITeacherEarningsSession } from "@/types/teacher.interface";

function SessionFeeTable({ rows }: { rows: ITeacherEarningsSession[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-brand-200 bg-white p-6 text-center text-sm text-brand-700">
        No paid sessions in this period.
      </div>
    );
  }
  return (
    <>
      <ul className="space-y-2 sm:hidden">
        {rows.map((row) => (
          <li key={row.session_id} className="rounded-lg border border-brand-100 bg-white px-4 py-3">
            <p className="text-sm font-bold text-brand-900">{row.session_name}</p>
            <div className="mt-1 flex items-center justify-between gap-3 text-sm">
              <span className="text-brand-700">{formatDateHelper(row.session_date, "dd MMM yyyy")}</span>
              <span className="tabular-nums font-semibold text-brand-900">{formatCurrency(row.fee)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border border-brand-100 bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-700">
            <tr>
              <th scope="col" className="w-1/4 px-4 py-3 font-semibold">Date</th>
              <th scope="col" className="px-4 py-3 font-semibold">Session</th>
              <th scope="col" className="w-1/4 px-4 py-3 text-right font-semibold">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {rows.map((row) => (
              <tr key={row.session_id}>
                <td className="px-4 py-3 text-brand-700">{formatDateHelper(row.session_date, "dd MMM yyyy")}</td>
                <td className="px-4 py-3 font-semibold text-brand-900">{row.session_name}</td>
                <td className="px-4 py-3 text-right tabular-nums text-brand-900">{formatCurrency(row.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function TeacherEarningsView() {
  const [period, setPeriod] = useState<string>("");
  const { data, isLoading, isError, refetch } = useTeacherEarnings(period);
  const earnings = data?.data;

  // Resolve the deep-linked period after mount so prerender and hydration agree.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("period");
    setPeriod(requested && /^\d{4}-\d{2}$/.test(requested) ? requested : currentPeriod());
  }, []);

  const options = periodOptions();
  if (period && !options.includes(period)) options.unshift(period);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Earnings</h1>
          <p className="mt-1 text-sm text-brand-700">
            Pay period runs from the 24th of the previous month to the 23rd of this month.
          </p>
        </div>
        <PeriodFilter
          id="earnings-period"
          value={period}
          options={options}
          onChange={setPeriod}
        />
      </div>

      {!period || isLoading ? (
        <div className="mt-6 space-y-3" aria-busy="true" aria-label="Loading earnings">
          <Skeleton className="h-32 w-full bg-brand-50" />
          <Skeleton className="h-48 w-full bg-brand-50" />
        </div>
      ) : isError ? (
        <div className="mt-6 rounded-lg border border-brand-100 bg-white p-6 text-center">
          <p className="text-sm text-brand-700">Earnings could not be loaded.</p>
          <Button variant="outline" className="mt-3 min-h-11" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : earnings ? (
        <>
          <section className="mt-6 rounded-xl border border-brand-100 bg-white p-5" aria-label="Period total">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-brand-600">
                  {earnings.period_label} · {formatDateHelper(earnings.period_start, "dd MMM")} to{" "}
                  {formatDateHelper(earnings.period_end, "dd MMM yyyy")}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-brand-900 sm:text-4xl">
                  {formatCurrency(earnings.total_payment)}
                </p>
              </div>
              <Badge
                className={earnings.source === "invoice"
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-brand-200 bg-brand-50 text-brand-800"}
              >
                {earnings.source === "invoice" ? "Invoice total" : "Estimate"}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-brand-700">
              Lifetime invoiced:{" "}
              <span className="font-semibold tabular-nums text-brand-900">{formatCurrency(earnings.lifetime_total)}</span>
            </p>
            {earnings.provisional && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                This period is still open until 23:59 WIB on {formatDateHelper(earnings.period_end, "dd MMM yyyy")}. The
                total can still change.
              </div>
            )}
          </section>

          <section className="mt-6" aria-labelledby="earnings-sessions-heading">
            <h2 id="earnings-sessions-heading" className="text-lg font-bold text-brand-900">Per session</h2>
            <div className="mt-3">
              <SessionFeeTable rows={earnings.sessions} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
