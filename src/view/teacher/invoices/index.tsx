"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherInvoiceDownload, useTeacherInvoices } from "@/hooks/api/queries/teacher/use-teacher";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import {
  currentPeriod,
  nextPeriod,
  pad,
  periodBounds,
  periodLabel,
} from "@/view/teacher/period";
import type { ITeacherInvoice } from "@/types/teacher.interface";

const periodOf = (invoice: ITeacherInvoice) => `${invoice.report_year}-${pad(invoice.report_month)}`;

type InvoiceRow =
  | { kind: "invoice"; invoice: ITeacherInvoice }
  | { kind: "pending"; period: string };

function buildRows(invoices: ITeacherInvoice[], current: string | null): InvoiceRow[] {
  if (invoices.length === 0) return [];
  const rows: InvoiceRow[] = invoices.map((invoice) => ({ kind: "invoice", invoice }));
  if (!current) return rows;
  let period = nextPeriod(periodOf(invoices[0]));
  while (period <= current) {
    rows.push({ kind: "pending", period });
    period = nextPeriod(period);
  }
  return rows;
}

function StatusBadge({ kind, invoice }: { kind: "invoice" | "pending"; invoice?: ITeacherInvoice }) {
  if (kind === "pending") {
    return <Badge variant="outline" className="text-brand-500">Not invoiced yet</Badge>;
  }
  if (invoice?.status === "paid") {
    return <Badge className="border-brand-500 bg-brand-500 text-white">Paid</Badge>;
  }
  return <Badge variant="outline" className="border-brand-300 text-brand-700">Invoiced</Badge>;
}

export default function TeacherInvoicesView() {
  const { data, isLoading, isError, refetch } = useTeacherInvoices();
  const { mutateAsync } = useTeacherInvoiceDownload();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);

  // Resolve WIB today after mount so prerender and hydration agree.
  useEffect(() => {
    setCurrent(currentPeriod());
  }, []);

  const invoices = data?.data ?? [];
  const rows = buildRows(invoices, current);

  const download = async (id: string) => {
    setDownloading(id);
    setFailed(null);
    try {
      let res;
      try {
        res = await mutateAsync(id);
      } catch {
        res = await mutateAsync(id);
      }
      const url = res?.data?.download_url;
      if (!url) throw new Error("download url missing");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setFailed(id);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Invoices</h1>
        <p className="mt-1 text-sm text-brand-700">
          One invoice per pay period. Paid means the transfer has been recorded by the studio.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3" aria-busy="true" aria-label="Loading invoices">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full bg-brand-50" />)}
        </div>
      ) : isError ? (
        <div className="mt-6 rounded-lg border border-brand-100 bg-white p-6 text-center">
          <p className="text-sm text-brand-700">Invoices could not be loaded.</p>
          <Button variant="outline" className="mt-3 min-h-11" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-brand-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-brand-800">No invoices yet</p>
          <p className="mt-1 text-sm text-brand-700">
            Your first invoice appears here after the studio generates it for a closed pay period.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => {
            if (row.kind === "pending") {
              const bounds = periodBounds(row.period);
              return (
                <li key={`pending-${row.period}`} className="rounded-xl border border-dashed border-brand-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-brand-900">{periodLabel(row.period)}</p>
                      <p className="mt-0.5 text-sm text-brand-700">
                        {formatDateHelper(bounds.start, "dd MMM")} to {formatDateHelper(bounds.end, "dd MMM yyyy")}
                      </p>
                    </div>
                    <StatusBadge kind="pending" />
                  </div>
                </li>
              );
            }

            const invoice = row.invoice;
            const isFailed = failed === invoice.id;
            const isDownloading = downloading === invoice.id;
            return (
              <li key={invoice.id} className="rounded-xl border border-brand-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-brand-900">{periodLabel(periodOf(invoice))}</p>
                    <p className="mt-0.5 text-sm text-brand-700">
                      {formatDateHelper(invoice.period_start, "dd MMM")} to{" "}
                      {formatDateHelper(invoice.period_end, "dd MMM yyyy")}
                    </p>
                  </div>
                  <StatusBadge kind="invoice" invoice={invoice} />
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold text-brand-600">Invoice total</dt>
                    <dd className="mt-0.5 text-lg font-bold tabular-nums text-brand-900">
                      {formatCurrency(invoice.total_payment)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-brand-600">Generated</dt>
                    <dd className="mt-0.5 text-brand-900">
                      {formatDateHelper(invoice.generated_at, "dd MMM yyyy")}
                    </dd>
                  </div>
                  {invoice.paid_at && (
                    <div>
                      <dt className="text-xs font-semibold text-brand-600">Paid</dt>
                      <dd className="mt-0.5 text-brand-900">
                        {formatDateHelper(invoice.paid_at, "dd MMM yyyy")}
                        {invoice.paid_reference ? (
                          <span className="block text-xs text-brand-600">Ref: {invoice.paid_reference}</span>
                        ) : null}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    className="min-h-11"
                    disabled={isDownloading}
                    onClick={() => download(invoice.id)}
                  >
                    <Download aria-hidden="true" />
                    {isDownloading ? "Preparing..." : isFailed ? "Retry download" : "Download CSV"}
                  </Button>
                  {isFailed && (
                    <p className="text-sm text-red-700" role="status">
                      The download link could not be created. Try again.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
