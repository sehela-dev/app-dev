"use client";

import { exportRefundReportCsv } from "@/api-req/report";
import { CustomTable } from "@/components/general/custom-table";
import { BackButtonComponent } from "@/components/general/back-button";
import { CustomPagination } from "@/components/general/pagination-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetRefundReport } from "@/hooks/api/queries/admin/report/outstanding-credit";
import { formatCurrency } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IRefundReportRow, RefundReportStatus, RefundReportType } from "@/types/report.interface";
import { Download, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ponytail: WIB month via Intl, same as orders report
const currentWibMonth = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);

const STATUS_OPTIONS: { value: RefundReportStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "requested", label: "Requested" },
  { value: "processing", label: "Processing" },
  { value: "succeeded", label: "Confirmed" },
  { value: "failed", label: "Rejected" },
];

const TYPE_OPTIONS: { value: RefundReportType | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "refund", label: "Refund" },
  { value: "void", label: "Void" },
];

// BE exact-matches the resolved method; empty/all = no filter.
const PAYMENT_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "credits", label: "Credits" },
  { value: "cash", label: "Cash" },
  { value: "edc", label: "EDC" },
  { value: "transfer", label: "Transfer" },
  { value: "midtrans", label: "Midtrans" },
  { value: "third_party", label: "Third Party" },
];

const verdictClass = (verdict?: string) =>
  (verdict ?? "").toLowerCase() === "void" ? "border-violet-200 bg-violet-50 text-violet-700" : "border-blue-200 bg-blue-50 text-blue-700";

const statusClass = (display?: string) => {
  switch ((display ?? "").toLowerCase()) {
    case "requested":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "processing":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "confirmed":
      return "border-green-200 bg-green-50 text-green-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-600";
    default:
      return "";
  }
};

const errorMessage = async (e: unknown, fallback: string) => {
  const data = (e as { response?: { data?: unknown } })?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text()) as { error?: { code?: string; message?: string } };
      return parsed.error?.message ?? fallback;
    } catch {
      return fallback;
    }
  }
  return (data as { error?: { message?: string } } | undefined)?.error?.message ?? fallback;
};

const errorCode = async (e: unknown) => {
  const data = (e as { response?: { data?: unknown } })?.response?.data;
  if (data instanceof Blob) {
    try {
      return (JSON.parse(await data.text()) as { error?: { code?: string } }).error?.code;
    } catch {
      return undefined;
    }
  }
  return (data as { error?: { code?: string } } | undefined)?.error?.code;
};

export const RefundReportView = () => {
  const [month, setMonth] = useState(currentWibMonth());
  const [status, setStatus] = useState<RefundReportStatus | "all">("all");
  const [type, setType] = useState<RefundReportType | "all">("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const limit = 20;

  const resetPage = () => setPage(1);

  const monthError = useMemo(() => {
    if (!month) return "Bulan wajib diisi.";
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return "Format bulan tidak valid (YYYY-MM).";
    return null;
  }, [month]);

  const params = {
    month: monthError ? "" : month,
    status,
    type,
    ...(paymentMethod !== "all" ? { payment_method: paymentMethod } : {}),
    ...(search ? { search } : {}),
    page,
    page_size: limit,
  };

  const { data, isLoading, isError, error } = useGetRefundReport(params);

  const headers = [
    { id: "customerName", text: "Nama Customer", value: (row: IRefundReportRow) => row.customerName || "-" },
    { id: "session", text: "Session", value: (row: IRefundReportRow) => row.session || "-" },
    { id: "paymentMethod", text: "Payment Method", value: (row: IRefundReportRow) => <span className="capitalize">{row.paymentMethod || "-"}</span> },
    {
      id: "verdict",
      text: "Refund/Void",
      value: (row: IRefundReportRow) => (
        <Badge variant="outline" className={cn("capitalize", verdictClass(row.verdict))}>
          {row.verdict}
        </Badge>
      ),
    },
    {
      id: "amountIdr",
      text: "Amount",
      value: (row: IRefundReportRow) => <span className="font-medium whitespace-nowrap">{formatCurrency(row.amountIdr)}</span>,
    },
    {
      id: "requestedAt",
      text: "Requested at",
      value: (row: IRefundReportRow) => <span className="whitespace-nowrap">{row.requestedAt || "—"}</span>,
    },
    {
      id: "confirmedAt",
      text: "Confirmed at",
      value: (row: IRefundReportRow) => <span className="whitespace-nowrap">{row.confirmedAt || "—"}</span>,
    },
    { id: "reviewer", text: "Reviewer", value: (row: IRefundReportRow) => row.reviewer || "-" },
    { id: "movement", text: "Movement", value: (row: IRefundReportRow) => <span className="capitalize">{row.movement || "-"}</span> },
    {
      id: "statusDisplay",
      text: "Status",
      value: (row: IRefundReportRow) => (
        <Badge variant="outline" className={cn("capitalize", statusClass(row.statusDisplay))}>
          {row.statusDisplay}
        </Badge>
      ),
    },
    { id: "transactionBy", text: "Transaction by", value: (row: IRefundReportRow) => row.transactionBy || "-" },
  ];

  const numberOptions = {
    text: "No",
    show: false,
    render: (row: IRefundReportRow) => row.no,
  };

  const handleExport = async () => {
    if (monthError) {
      toast.error("Bulan tidak valid", { description: monthError });
      return;
    }
    try {
      setExporting(true);
      const blob = await exportRefundReportCsv({
        month,
        status,
        type,
        ...(paymentMethod !== "all" ? { payment_method: paymentMethod } : {}),
        ...(search ? { search } : {}),
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `refund_void_${month}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (e: unknown) {
      const code = await errorCode(e);
      toast.error("Gagal mengunduh", {
        description:
          code === "EXPORT_TOO_LARGE"
            ? "Terlalu banyak baris — persempit filter."
            : await errorMessage(e, "Silakan coba lagi"),
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <BackButtonComponent page="/admin/report">
        <span className="text-sm font-medium text-gray-500">Back to Reports</span>
      </BackButtonComponent>
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex w-full flex-row items-center justify-between gap-2">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Refund Report</h3>
            <p className="text-sm font-normal text-gray-500">Refund rows only — preview matches the exported CSV.</p>
          </div>
          <Button variant="outline" className="text-sm font-medium" disabled={exporting || !!monthError} onClick={handleExport}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-row flex-wrap gap-2">
            <Input
              type="month"
              value={month}
              onChange={(e) => {
                if (e.target.value) {
                  setMonth(e.target.value);
                  resetPage();
                }
              }}
              className="w-44"
            />
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as RefundReportStatus | "all");
                resetPage();
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as RefundReportType | "all");
                resetPage();
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={paymentMethod}
              onValueChange={(v) => {
                setPaymentMethod(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search customer name…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="w-56"
            />
          </div>
          {monthError ? (
            <p className="text-sm text-red-500">{monthError}</p>
          ) : isError && !isLoading ? (
            <p className="text-sm text-red-500">
              {(error as { response?: { data?: { error?: { message?: string } } }; message?: string })?.response?.data?.error?.message ??
                (error as Error | undefined)?.message ??
                "Failed to load report"}
            </p>
          ) : !isLoading && (data?.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data for this month — try another month or clearing filters.</p>
          ) : (
            <CustomTable data={data?.data ?? []} headers={headers} isLoading={isLoading} numberOptions={numberOptions} />
          )}
        </CardContent>
        <CardFooter className="flex w-full flex-col gap-2">
          {data?.totals ? (
            <p className="text-sm font-medium">
              {data.totals.row_count} baris • {formatCurrency(data.totals.total_amount_idr)}
            </p>
          ) : null}
          <CustomPagination
            onPageChange={setPage}
            currentPage={page}
            showTotal
            hasPrevPage={data?.pagination?.has_prev}
            hasNextPage={data?.pagination?.has_next}
            totalItems={data?.pagination?.total_items as number}
            totalPages={data?.pagination?.total_pages as number}
            limit={limit}
          />
        </CardFooter>
      </Card>
    </div>
  );
};
