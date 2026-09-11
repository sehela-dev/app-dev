"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { CardRevenueComponent } from "@/components/page/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTH_LIST, YEAR_LIST } from "@/constants/sample-data";
import { exportCreditsLedger, exportOutstandingDetailCsv, runRecognition } from "@/api-req/report";
import { useGenerateOutstandingReport } from "@/hooks/api/mutations/admin";
import { useGetCreditsLedger } from "@/hooks/api/queries/admin/report/outstanding-credit/use-get-credits-ledger";
import { useGetCreditsLedgerSummary } from "@/hooks/api/queries/admin/report/outstanding-credit/use-get-credits-ledger-summary";
import { useGetOutstandingDetail } from "@/hooks/api/queries/admin/report/outstanding-credit/use-get-outstanding-detail";
import { useGetOutstandingSummary } from "@/hooks/api/queries/admin/report/outstanding-credit/use-get-outstanding-summary";
import { useListOutstandingReports } from "@/hooks/api/queries/admin/report/outstanding-credit/use-list-outstanding-reports";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import {
  ICreditsLedgerItem,
  ICreditsLedgerSummary,
  IGeenrateOutstandingResponse,
  IPackage,
  LedgerEntryType,
  RecognitionStatus,
} from "@/types/report.interface";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BadgeDollarSign,
  DollarSign,
  Download,
  FileText,
  Hourglass,
  Landmark,
  Loader2,
  RotateCcw,
  Search,
  ShoppingBag,
  TimerOff,
  UserX,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useGetCustomers } from "@/hooks/api/queries/admin/customers";
import { useDebounce } from "@/hooks";
import ReactSelect from "react-select";

// Tailwind needs literal classes — do not use `bg-${color}` (purged)
const PACKAGE_STATUS: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-500 text-white border-green-600" },
  not_started: { label: "Not Started", className: "bg-gray-400 text-white border-gray-500" },
  expiring_soon: { label: "Expires Soon", className: "bg-yellow-200 text-yellow-900 border-yellow-300" },
  fully_used: { label: "Fully Used", className: "bg-blue-800 text-white border-blue-900" },
  expired: { label: "Expired", className: "bg-red-500 text-white border-red-600" },
  // BE validity_status aliases
  expiring_0_7_days: { label: "Expires Soon", className: "bg-yellow-200 text-yellow-900 border-yellow-300" },
  t_started: { label: "Not Started", className: "bg-gray-400 text-white border-gray-500" },
};

const tabOption = [
  {
    name: "Snapshot (Outstanding)",
    value: "snapshot",
  },
  {
    name: "Log (Movements)",
    value: "log",
  },
];

const snapshotTabOption = [
  { name: "Preview", value: "preview" },
  { name: "Export", value: "export" },
];

const defaultValues = {
  month: "",
  year: "",
};

export const OutstandingCreditView = () => {
  const methods = useForm({ defaultValues });
  const searchParams = useSearchParams();
  const router = useRouter();
  const legacyView = searchParams.get("view");
  const initialTab = legacyView === "log" ? "log" : "snapshot";
  const initialSubTab = searchParams.get("subview") === "export" || legacyView === "export" ? "export" : "preview";
  const [tabs, setTabs] = useState(initialTab);
  const [snapshotTab, setSnapshotTab] = useState(initialSubTab);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [asOf, setAsOf] = useState(searchParams.get("as_of") ?? todayStr);
  const [page, setPage] = useState(1);
  const [csvExporting, setCsvExporting] = useState(false);

  const handleAsOfChange = (startDate: string) => {
    if (!startDate) return;
    if (startDate > todayStr) {
      toast.error("as_of cannot be in the future");
      return;
    }
    setPage(1);
    setAsOf(startDate);
  };

  // sync tab + as_of to URL
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    if (tabs === "log") {
      p.set("view", "log");
      p.delete("subview");
      p.delete("as_of");
    } else {
      p.delete("view");
      if (snapshotTab === "export") p.set("subview", "export");
      else p.delete("subview");
      if (snapshotTab === "preview" && asOf) p.set("as_of", asOf);
      else if (snapshotTab !== "preview") p.delete("as_of");
    }
    const qs = p.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false } as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, snapshotTab, asOf]);

  const formField = methods.watch();

  const [generatedFile, setGeneratedFile] = useState<IGeenrateOutstandingResponse | null>(null);

  // Outstanding as_of checkpoint — snapshot harian (BE: as_of 23:59:59 WIB)
  const {
    data: detailData,
    isLoading: detailLoading,
    isFetching: detailFetching,
    isError: detailError,
    error: detailErr,
  } = useGetOutstandingDetail({ asOf: asOf });
  const { data: summaryData, isLoading: summaryLoading } = useGetOutstandingSummary({ asOf: asOf });

  const { mutateAsync, isPending } = useGenerateOutstandingReport();

  const headers = [
    {
      id: "customer-name",
      text: "Customer Name",
      value: "customer_name",
    },

    {
      id: "package-name",
      text: "Package Name",
      value: "package_name",
    },
    {
      id: "package_status",
      text: "Package Status",
      value: (row: IPackage) => {
        const key = (row as unknown as { package_status?: string; validity_status?: string }).validity_status ?? row.package_status ?? "";
        const s = PACKAGE_STATUS[key] ?? { label: key ? key.replace(/_/g, " ") : "-", className: "bg-gray-100 text-gray-700 border-gray-200" };
        return <Badge className={`${s.className} capitalize`}>{s.label}</Badge>;
      },
    },
    {
      id: "total-credits",
      text: "Total Credits",
      value: "total_credits",
    },
    {
      id: "credits-remaining",
      text: "Credits Remaining",
      value: "credits_remaining",
    },
    {
      id: "credits-used",
      text: "Credits Used",
      value: "credits_used",
    },
    {
      id: "credits-expired",
      text: "Credits Expired",
      value: "credits_expired",
    },
    {
      id: "outstanding-value-idr",
      text: "Outstanding Value (IDR)",
      value: (row: IPackage) => (
        <span className="flex items-center gap-2">
          {formatCurrency(row.outstanding_value_idr)}
          {(row.package_type === "refund" || row.package_type === "rollover") && (
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
              {row.package_type}
            </Badge>
          )}
        </span>
      ),
    },
    {
      id: "purchased-at",
      text: "Purchased at",
      value: (row: IPackage) => (row?.purchased_at ? formatDateHelper(row.purchased_at as string) : "-"),
    },
    {
      id: "expired-at",
      text: "Expired at",
      value: (row: IPackage) => (row?.expires_at ? formatDateHelper(row.expires_at as string) : "-"),
    },
    {
      id: "days-until-expiry",
      text: "Days until Expiry",
      value: "days_until_expiry",
    },
  ];

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const paylaod = {
        month: data?.month as string,
        year: data?.year as string,
      };
      const res = await mutateAsync(paylaod);
      if (res) {
        setGeneratedFile(res?.data);
      }
    } catch (error) {
      console.log(error);
    }
  });
  return (
    <div className="flex flex-col gap-4 min-w-0 w-full max-w-full overflow-hidden">
      <GeneralTabComponent tabs={tabOption} selecetedTab={tabs} setTab={setTabs} />
      {tabs === "snapshot" && (
        <div className="flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
          <GeneralTabComponent tabs={snapshotTabOption} selecetedTab={snapshotTab} setTab={setSnapshotTab} variant="line" />
          {snapshotTab === "preview" && (
            <>
              <Card>
                <CardHeader className="text-2xl font-semibold">Preview Outstanding Credit</CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-sm font-medium">As of (checkpoint harian)</p>
                    <div className="flex w-full">
                      <DateRangePicker mode="single" startDate={asOf} onDateRangeChange={handleAsOfChange} allowPastDates allowFutureDates={false} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {(detailLoading || summaryLoading) && (detailFetching || summaryLoading) ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : detailError ? (
                <Card>
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    <p className="font-medium">Failed to load outstanding snapshot</p>
                    <p className="text-xs">
                      {(detailErr as unknown as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
                        (detailErr as Error)?.message ??
                        "Check BE /admin/credits/outstanding/detail?as_of=" + asOf}
                    </p>
                    <p className="text-xs mt-1">Fallback: try without as_of (year/month) or check the outstanding:view permission.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {(() => {
                    const summary = (
                      summaryData as unknown as { data?: { summary?: { total_outstanding_value_idr: number; total_outstanding_credits: number } } }
                    )?.data as unknown as
                      | {
                          summary?: {
                            total_outstanding_value_idr: number;
                            total_outstanding_credits: number;
                            total_customers?: number;
                            total_active_packages?: number;
                          };
                        }
                      | undefined;
                    const s =
                      (
                        summary as unknown as {
                          summary?: { total_outstanding_value_idr: number; total_outstanding_credits: number; total_customers?: number };
                        }
                      )?.summary ?? (summary as unknown as { total_outstanding_value_idr?: number; total_outstanding_credits?: number } | undefined);
                    const totalCredits =
                      (s as unknown as { total_outstanding_credits?: number })?.total_outstanding_credits ??
                      (detailData as unknown as { data?: { total_packages?: number } })?.data?.total_packages ??
                      0;
                    const totalValue = (s as unknown as { total_outstanding_value_idr?: number })?.total_outstanding_value_idr ?? 0;
                    return (
                      <div className="flex flex-row items-center w-full gap-4 pt-4">
                        <div className="w-full">
                          <CardRevenueComponent
                            amount={String(totalCredits)}
                            title={`Total Outstanding Credits (${asOf})`}
                            icon={<BadgeDollarSign style={{ color: "var(--color-gray-400)" }} size={18} />}
                          />
                        </div>
                        <div className="w-full">
                          <CardRevenueComponent
                            amount={formatCurrency(String(totalValue))}
                            title="Outstanding Value (IDR)"
                            icon={<DollarSign style={{ color: "var(--color-gray-400)" }} size={18} />}
                          />
                        </div>
                      </div>
                    );
                  })()}
                  <Card className="overflow-hidden min-w-0 max-w-full">
                    <CardHeader className="text-lg font-semibold flex flex-row items-center justify-between">
                      <span>
                        Outstanding Credit — as of {asOf}{" "}
                        {detailData && (detailData as unknown as { data?: { total_packages?: number } })?.data?.total_packages != null
                          ? `(${(detailData as unknown as { data: { total_packages: number } }).data.total_packages} packages)`
                          : ""}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={csvExporting}
                        onClick={async () => {
                          try {
                            setCsvExporting(true);
                            const blob = await exportOutstandingDetailCsv({ asOf });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `outstanding_detail_${asOf}.csv`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                          } catch (e: unknown) {
                            toast.error("Export failed", {
                              description:
                                (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
                                "Please try again",
                            });
                          } finally {
                            setCsvExporting(false);
                          }
                        }}
                      >
                        {csvExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        CSV
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0 pt-6 min-w-0 max-w-full overflow-hidden">
                      {(() => {
                        const pkgs = ((detailData as unknown as { data?: { packages?: IPackage[] } })?.data?.packages ?? []) as IPackage[];
                        const pageSize = 20;
                        const total = pkgs.length;
                        const paged = pkgs.slice((page - 1) * pageSize, page * pageSize);
                        return (
                          <div className="flex flex-col gap-4 min-w-0 max-w-full">
                            <div className="overflow-x-auto max-w-full px-6">
                              <CustomTable headers={headers} data={paged} />
                            </div>
                            {total > pageSize && (
                              <div className="px-6 pb-6">
                                <CustomPagination
                                  currentPage={page}
                                  totalItems={total}
                                  totalPages={Math.ceil(total / pageSize)}
                                  limit={pageSize}
                                  hasNextPage={page * pageSize < total}
                                  hasPrevPage={page > 1}
                                  onPageChange={setPage}
                                  showTotal
                                />
                              </div>
                            )}
                            {total === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4 px-6">No outstanding packages as of {asOf}.</p>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
          {snapshotTab === "export" && (
            <>
              <Card>
                <CardHeader className="text-2xl font-semibold">Export Data - Outstanding Credit</CardHeader>
                <CardContent>
                  <FormProvider {...methods}>
                    <form onSubmit={onSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={methods.control}
                          name={`month`}
                          rules={{
                            required: "Field Required!",
                          }}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className=" text-brand-999 font-medium text-sm" required>
                                Select Month
                              </FormLabel>
                              <FormControl>
                                <Select
                                  {...field}
                                  onValueChange={(e) => {
                                    field.onChange(e);
                                  }}
                                  defaultValue={field.value ?? ""}
                                  value={field.value ?? ""}
                                >
                                  <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                                    <SelectValue placeholder="Select Month" className="!text-gray-400" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {MONTH_LIST.map((item) => (
                                        <SelectItem value={item.value} key={item.value}>
                                          {item.label}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={methods.control}
                          name={`year`}
                          rules={{
                            required: "Field Required!",
                          }}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className=" text-brand-999 font-medium text-sm" required>
                                Select Year
                              </FormLabel>
                              <FormControl>
                                <Select
                                  {...field}
                                  onValueChange={(e) => {
                                    field.onChange(e);
                                  }}
                                  defaultValue={field.value ?? ""}
                                  value={field.value ?? ""}
                                >
                                  <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                                    <SelectValue placeholder="Select Year" className="!text-gray-400" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {YEAR_LIST.map((item) => (
                                        <SelectItem value={item} key={item}>
                                          {item}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex flex-row items-center w-full justify-end gap-4 pt-4">
                        <div>
                          <Button
                            type="button"
                            variant={"secondary"}
                            onClick={() => {
                              methods.reset();
                              setGeneratedFile(null);
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                        <div>
                          <Button disabled={!methods.formState.isValid || isPending}>Export Report</Button>
                        </div>
                      </div>
                    </form>
                  </FormProvider>
                </CardContent>
              </Card>
              {generatedFile && (
                <div className="flex flex-col gap-4 w-full items-center pt-4">
                  <ReportDownloads
                    detailFileName={generatedFile?.detail_file?.file_name as string}
                    detailLink={generatedFile?.detail_file?.download_url as string}
                    summaryLink={generatedFile?.summary_file?.download_url as string}
                    summaryFileName={generatedFile?.summary_file?.file_name as string}
                    month={formField.month}
                    year={formField.year}
                  />
                </div>
              )}
              <OutstandingReportsList year={formField.year ? Number(formField.year) : undefined} visible={snapshotTab === "export"} />
            </>
          )}
        </div>
      )}
      {tabs === "log" && <CreditsLedgerLog />}
    </div>
  );
};

const ENTRY_TYPE_OPTIONS: { value: LedgerEntryType; label: string }[] = [
  { value: "credit_issue", label: "Issue" },
  { value: "credit_spend", label: "Spend" },
  { value: "credit_refund", label: "Refund" },
  { value: "credit_expired", label: "Expired" },
  { value: "adjustment", label: "Adjustment" },
];

const ENTRY_TYPE_CHIP: Record<string, string> = {
  credit_issue: "bg-green-100 text-green-700 border-green-200",
  credit_spend: "bg-red-100 text-red-700 border-red-200",
  credit_refund: "bg-blue-100 text-blue-700 border-blue-200",
  credit_expired: "bg-gray-100 text-gray-600 border-gray-200",
  adjustment: "bg-amber-100 text-amber-700 border-amber-200",
  Issue: "bg-green-100 text-green-700 border-green-200",
  Spend: "bg-red-100 text-red-700 border-red-200",
  Refund: "bg-blue-100 text-blue-700 border-blue-200",
  Expired: "bg-gray-100 text-gray-600 border-gray-200",
  Adjustment: "bg-amber-100 text-amber-700 border-amber-200",
};

const RECOGNITION_STATUS_OPTIONS: { value: RecognitionStatus; label: string; className: string }[] = [
  { value: "Recognized Revenue", label: "Recognized Revenue", className: "bg-green-100 text-green-700 border-green-200" },
  { value: "Deferred Future Revenue", label: "Deferred Future Revenue", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "Credit Reserved", label: "Credit Reserved", className: "bg-gray-100 text-gray-600 border-gray-200" },
  { value: "Credit Refunded", label: "Credit Refunded", className: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "Refund Future Revenue", label: "Refund Future Revenue", className: "bg-red-100 text-red-700 border-red-200" },
];

const RECOGNITION_CHIP: Record<string, string> = Object.fromEntries(RECOGNITION_STATUS_OPTIONS.map((o) => [o.value, o.className]));

// ponytail: single shared copy — paste §6 verbatim on every revenue/session surface
const RECOGNITION_DISCLAIMER =
  "Revenue is recognized as earned at the daily 23:59 WIB checkpoint (not cash basis): classes ending today are recorded as revenue after the nightly run. Intraday figures are provisional.";

function CreditsLedgerLog() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const today = new Date();
  const d30 = new Date();
  d30.setDate(today.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [qInput, setQInput] = useState(searchParams.get("q") ?? "");
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [entryTypes, setEntryTypes] = useState<string[]>(
    searchParams.get("entry_type") ? (searchParams.get("entry_type") as string).split(",").filter(Boolean) : [],
  );
  const [statuses, setStatuses] = useState<string[]>(
    searchParams.get("status") ? (searchParams.get("status") as string).split(",").filter(Boolean) : [],
  );
  const [startDate, setStartDate] = useState(searchParams.get("start_date") ?? fmt(d30));
  const [endDate, setEndDate] = useState(searchParams.get("end_date") ?? fmt(today));
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"));
  const [pageSize] = useState(Number(searchParams.get("page_size") ?? "20"));
  const [order, setOrder] = useState<"asc" | "desc">((searchParams.get("order") as "asc" | "desc") ?? "desc");
  const [userId, setUserId] = useState(searchParams.get("user_id") ?? "");

  // member select — reuse member selects via useGetCustomers, q now only for package name
  const [memberSearch, setMemberSearch] = useState("");
  const debounceMemberSearch = useDebounce(memberSearch, 300);
  const { data: memberData, isLoading: memberLoading } = useGetCustomers({ search: debounceMemberSearch, status: "true" });
  const selectedMember = useMemo(() => {
    if (!userId) return null;
    const list = (memberData?.data as unknown as { id: string; full_name: string; phone: string }[] | undefined) ?? [];
    return (
      list.find((m) => m.id === userId) ??
      ({ id: userId, full_name: "Selected member", phone: "" } as unknown as { id: string; full_name: string; phone: string })
    );
  }, [userId, memberData]);

  // debounce q (package name only)
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput), 400);
    return () => clearTimeout(t);
  }, [qInput]);

  // reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [q, entryTypes, statuses, startDate, endDate, order, userId]);

  // persist to URL
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("view", "log");
    if (q) p.set("q", q);
    else p.delete("q");
    if (entryTypes.length) p.set("entry_type", entryTypes.join(","));
    else p.delete("entry_type");
    if (statuses.length) p.set("status", statuses.join(","));
    else p.delete("status");
    if (startDate) p.set("start_date", startDate);
    if (endDate) p.set("end_date", endDate);
    p.set("page", String(page));
    p.set("page_size", String(pageSize));
    p.set("order", order);
    if (userId) p.set("user_id", userId);
    router.replace(`?${p.toString()}`, { scroll: false } as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, entryTypes, statuses, startDate, endDate, page, pageSize, order]);

  const rangeError = useMemo(() => {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (s > e) return "start_date > end_date";
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    if (diff > 31) return "Maximum range is 31 days";
    return null;
  }, [startDate, endDate]);

  const params = useMemo(
    () => ({
      q: q || undefined,
      entry_type: entryTypes.length ? entryTypes.join(",") : undefined,
      status: statuses.length ? statuses.join(",") : undefined,
      start_date: !rangeError ? startDate : undefined,
      end_date: !rangeError ? endDate : undefined,
      page,
      page_size: pageSize,
      order,
      user_id: userId || undefined,
    }),
    [q, entryTypes, statuses, startDate, endDate, page, pageSize, order, userId, rangeError],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useGetCreditsLedger(params);

  // Filtered summary reconciles with the table (passes entry_type).
  const summaryParams = useMemo(
    () => ({
      q: q || undefined,
      entry_type: entryTypes.length ? entryTypes.join(",") : undefined,
      start_date: !rangeError ? startDate : undefined,
      end_date: !rangeError ? endDate : undefined,
      user_id: userId || undefined,
    }),
    [q, entryTypes, startDate, endDate, userId, rangeError],
  );
  const { data: summaryRes, isLoading: summaryLoading, refetch: refetchSummary } = useGetCreditsLedgerSummary(summaryParams, !rangeError);

  // Period summary drives the accrual cards — omits entry_type by design.
  // Credit buckets (sold/recognized/breakage) are derived from the filtered row-set,
  // so a table-filtered summary would zero them; cash ignores entry_type entirely.
  const periodParams = useMemo(
    () => ({
      q: q || undefined,
      start_date: !rangeError ? startDate : undefined,
      end_date: !rangeError ? endDate : undefined,
      user_id: userId || undefined,
    }),
    [q, startDate, endDate, userId, rangeError],
  );
  const {
    data: periodRes,
    isLoading: periodLoading,
    refetch: refetchPeriodSummary,
  } = useGetCreditsLedgerSummary(periodParams, !rangeError);

  const [exporting, setExporting] = useState(false);
  const [running, setRunning] = useState(false);

  const handleRunRecognition = async () => {
    if (running) return;
    try {
      setRunning(true);
      const r = await runRecognition(endDate || undefined);
      toast.success("Recognition run completed", {
        description: `Credit attended ${r.credit_attended} · credit no-show ${r.credit_no_show} · cash attended ${r.cash_attended} · breakage ${r.breakage} (job ${r.job_date})`,
        position: "top-center",
      });
      refetch();
      refetchSummary();
      refetchPeriodSummary?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      toast.error("Recognition run failed", { description: err?.response?.data?.error?.message ?? "Please try again", position: "top-center" });
    } finally {
      setRunning(false);
    }
  };

  const handleExportCsv = async () => {
    if (rangeError) {
      toast.error("Invalid date range", { description: rangeError, position: "top-center" });
      return;
    }
    try {
      setExporting(true);
      const blob = await exportCreditsLedger({
        q: q || undefined,
        entry_type: entryTypes.length ? entryTypes.join(",") : undefined,
        status: statuses.length ? statuses.join(",") : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        order,
        user_id: userId || undefined,
        // dedicated export: no pagination — BE ignores page when format=csv
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const typeSuffix = entryTypes.length ? `_${entryTypes.join("-")}` : "";
      const qSuffix = q ? `_q-${q.replace(/\s+/g, "_")}` : "";
      a.download = `credits_ledger_${startDate}_${endDate}${typeSuffix}${qSuffix}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export started", { description: "CSV downloaded", position: "top-center" });
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { error?: { message?: string } } } };
      toast.error("Export failed", { description: err?.response?.data?.error?.message ?? "Please try again", position: "top-center" });
    } finally {
      setExporting(false);
    }
  };

  const toggleEntryType = (v: string) => setEntryTypes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  const toggleStatus = (v: string) => setStatuses((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  // §4: 12 kolom bisnis — Entry Type | Customer | Amount | Nilai IDR | Package | Expiry | Session | Attendance | Recognition Status | Note | Recognized at | created_at
  const headers = useMemo(
    () => [
      {
        id: "entry_type",
        text: "Entry Type",
        value: (row: ICreditsLedgerItem) => (
          <Badge variant="outline" className={`capitalize text-xs ${ENTRY_TYPE_CHIP[row.entry_type] ?? ""}`}>
            {row.entry_type}
          </Badge>
        ),
      },
      {
        id: "customer_name",
        text: "Customer",
        value: (row: ICreditsLedgerItem) => row.customer_name ?? "—",
      },
      {
        id: "amount",
        text: "Amount",
        value: (row: ICreditsLedgerItem) =>
          row.amount == null ? (
            "—"
          ) : (
            <span className={row.amount < 0 ? "text-red-600 font-semibold" : row.amount > 0 ? "text-green-600 font-semibold" : ""}>
              {row.amount > 0 ? `+${row.amount}` : row.amount}
            </span>
          ),
      },
      {
        id: "nilai_idr",
        text: "Value (IDR)",
        value: (row: ICreditsLedgerItem) =>
          row.nilai_idr == null ? (
            "—"
          ) : (
            <span className={row.nilai_idr < 0 ? "text-red-600 font-semibold" : row.nilai_idr > 0 ? "text-green-600 font-semibold" : ""}>
              {row.nilai_idr < 0 ? `-${formatCurrency(Math.abs(row.nilai_idr))}` : formatCurrency(row.nilai_idr)}
            </span>
          ),
      },
      {
        id: "package_name",
        text: "Package",
        value: (row: ICreditsLedgerItem) => row.package_name ?? "—",
      },
      {
        id: "expiry_date",
        text: "Expiry Date",
        value: (row: ICreditsLedgerItem) => (row.expiry_date ? formatDateHelper(row.expiry_date, "dd MMM yyyy") : "—"),
      },
      {
        id: "session_date",
        text: "Class / Session Date",
        value: (row: ICreditsLedgerItem) => (row.session_date ? formatDateHelper(row.session_date, "dd MMM yyyy HH:mm") : "—"),
      },
      {
        id: "attendance",
        text: "Attendance",
        value: (row: ICreditsLedgerItem) =>
          !row.attendance ? (
            "—"
          ) : (
            <Badge
              variant="outline"
              className={`capitalize text-xs ${
                row.attendance === "attended" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {row.attendance.replace("_", " ")}
            </Badge>
          ),
      },
      {
        id: "recognition_status",
        text: "Recognition Status",
        value: (row: ICreditsLedgerItem) => (
          <span className="flex flex-col gap-0.5">
            <Badge variant="outline" className={`text-xs whitespace-nowrap ${RECOGNITION_CHIP[row.recognition_status] ?? ""}`}>
              {row.recognition_status}
            </Badge>
            {row.recognition_month && <span className="text-[10px] text-muted-foreground">{row.recognition_month}</span>}
          </span>
        ),
      },
      {
        id: "note",
        text: "Note",
        value: (row: ICreditsLedgerItem) => (
          <span className="block max-w-[240px] truncate" title={row.note ?? ""}>
            {row.note ?? "—"}
          </span>
        ),
      },
      {
        id: "recognized_at",
        text: "Recognized at",
        value: (row: ICreditsLedgerItem) => (row.recognized_at ? formatDateHelper(row.recognized_at, "dd MMM yyyy HH:mm") : "—"),
      },
      {
        id: "created_at",
        text: "Created at",
        value: (row: ICreditsLedgerItem) => row.created_at_wib || formatDateHelper(row.created_at, "dd MMM yyyy HH:mm") + " WIB",
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card className="w-full max-w-vw">
        <CardHeader className="text-lg font-semibold">Credit Ledger (earned 23:59 WIB)</CardHeader>
        <CardContent className="flex flex-col gap-4 w-full">
          <p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">{RECOGNITION_DISCLAIMER}</p>
          {/* filters — q = customer OR package OR note; member select narrows via user_id */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="flex flex-col gap-1 md:col-span-4">
              <p className="text-sm font-medium">Search customer / package / note</p>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search customer, package, note..." value={qInput} onChange={(e) => setQInput(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-6">
              <p className="text-sm font-medium">Date Range</p>
              <DateRangePicker
                mode="range"
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={(s, e) => {
                  if (!s && !e) return;
                  if (s) setStartDate(s);
                  if (e) setEndDate(e);
                }}
                allowPastDates
                allowFutureDates={false}
                maxSelectionDays={31}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <p className="text-sm font-medium">Order</p>
              <Select value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest</SelectItem>
                  <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Member (customer)</p>
            <ReactSelect
              isClearable
              isLoading={memberLoading}
              placeholder="Select member..."
              value={
                selectedMember
                  ? ({
                      value: (selectedMember as unknown as { id: string }).id,
                      label: `${(selectedMember as unknown as { full_name: string }).full_name} - ${
                        (selectedMember as unknown as { phone: string }).phone ?? ""
                      }`,
                      id: (selectedMember as unknown as { id: string }).id,
                    } as unknown as never)
                  : null
              }
              options={
                (memberData?.data as unknown as { id: string; full_name: string; phone: string }[] | undefined)?.map(
                  (m) =>
                    ({
                      value: m.id,
                      label: `${m.full_name} - ${m.phone ?? ""}`,
                      id: m.id,
                    } as unknown as never),
                ) ?? []
              }
              onInputChange={(v) => setMemberSearch(v)}
              inputValue={memberSearch}
              onChange={(opt) => {
                const v = opt as unknown as { value: string } | null;
                setUserId(v?.value ?? "");
              }}
              classNames={{
                control: () => "!min-h-[40px] !border-input !bg-background",
                placeholder: () => "text-muted-foreground",
                singleValue: () => "text-foreground",
              }}
              styles={{
                control: (base) => ({ ...base, minHeight: 40, borderRadius: 6 }),
              }}
              getOptionValue={(opt) => (opt as unknown as { value: string }).value}
              getOptionLabel={(opt) => (opt as unknown as { label: string }).label}
            />
            <p className="text-xs text-muted-foreground">
              Filters ledger by member via <code>user_id</code>; free text <code>q</code> matches customer / package / note.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Type:</span>
            {ENTRY_TYPE_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Checkbox checked={entryTypes.includes(o.value)} onCheckedChange={() => toggleEntryType(o.value)} />
                <Badge variant="outline" className={`${ENTRY_TYPE_CHIP[o.value]} text-xs`}>
                  {o.label}
                </Badge>
              </label>
            ))}
            {entryTypes.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setEntryTypes([])}>
                Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            {RECOGNITION_STATUS_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Checkbox checked={statuses.includes(o.value)} onCheckedChange={() => toggleStatus(o.value)} />
                <Badge variant="outline" className={`${o.className} text-xs`}>
                  {o.label}
                </Badge>
              </label>
            ))}
            {statuses.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setStatuses([])}>
                Clear
              </Button>
            )}
          </div>

          {rangeError && <p className="text-sm text-red-600">{rangeError}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button onClick={handleRunRecognition} disabled={!!rangeError || running} variant="default" size="sm">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Run Recognition ({endDate || "today"})
            </Button>
            <Button onClick={handleExportCsv} disabled={!!rangeError || exporting} variant="outline" size="sm">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Statuses are calculated as of {endDate || "today"} · daily auto-run at 23:59 WIB; the button is for backfill / corrections only (idempotent).
          </p>
        </CardContent>
      </Card>

      {/* KPI header from GET /admin/credits/ledger/summary — filtered set reconciles with the table; accrual cards use the period (unfiltered entry_type) summary */}
      {(() => {
        const unwrap = (res: unknown) => {
          const s = (res as unknown as { data?: ICreditsLedgerSummary | { data: ICreditsLedgerSummary } })?.data as unknown as
            | ICreditsLedgerSummary
            | undefined;
          return (s as unknown as { data?: ICreditsLedgerSummary })?.data ?? s;
        };
        const summary = unwrap(summaryRes);
        const period = unwrap(periodRes);
        if (summaryLoading || periodLoading) {
          return (
            <Card className="w-full max-w-vw">
              <CardContent className="py-6 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          );
        }
        if (!summary) return null;
        const byType = summary.by_type ?? {};
        const getByType = (k: string) => byType[k] ?? { count: 0, credits: 0, value_idr: 0 };
        const issuance = getByType("credit_issue");
        const usage = getByType("credit_spend");
        const refund = getByType("credit_refund");
        const expired = getByType("credit_expired");
        const adjustment = getByType("adjustment");
        const byStatus = summary.by_status ?? {};
        const out =
          summary.outstanding ??
          (summary.outstanding_credits != null
            ? {
                packages: summary.outstanding_packages ?? 0,
                credits: summary.outstanding_credits ?? 0,
                value_idr: summary.outstanding_value_idr ?? 0,
              }
            : null);
        const netEmpty = summary.net_credits === 0 && summary.net_value_idr === 0;
        const outstandingAnomaly = !!out && out.credits > 0 && out.value_idr < 0;
        const filterEcho = summary.filters;
        const filterEntry = Array.isArray(filterEcho?.entry_type)
          ? (filterEcho.entry_type as string[]).join(", ")
          : (filterEcho?.entry_type as string | undefined);
        const isFiltered = !!filterEntry;
        const fmtSigned = (n: number) => (n > 0 ? `+${n.toLocaleString("en-US")}` : n.toLocaleString("en-US"));
        return (
          <Card className="w-full max-w-vw overflow-hidden border-muted-foreground/10">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold tracking-tight">Credit Movement Summary</h3>
                  <p className="text-xs text-muted-foreground">
                    {summary.period ?? summary.periode} · {summary.total_movements.toLocaleString("en-US")} movements in the
                    selected period · reconciles with the table below
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {filterEntry ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
                        Filtered by: {filterEntry}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px]">
                        Full period (no entry-type filter)
                      </Badge>
                    )}
                    {summary.filters?.user_id ? <Badge variant="outline" className="text-[11px]">Member filtered</Badge> : null}
                    {summary.filters?.q ? <Badge variant="outline" className="text-[11px]">Search: {summary.filters.q}</Badge> : null}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-medium">
                  Net {fmtSigned(summary.net_credits)} credits
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Row 1: movement breakdown by entry type (filtered — matches the ledger table) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <CardRevenueComponent
                  title="Issued"
                  amount={`${fmtSigned(issuance.credits)} credits`}
                  amountClassName="text-emerald-600"
                  subtitle={formatCurrency(issuance.value_idr)}
                  footer={`${issuance.count.toLocaleString("en-US")} movements · Dr Cash / Cr Deferred`}
                  icon={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <ArrowDownRight size={16} />
                    </span>
                  }
                />
                <CardRevenueComponent
                  title="Used"
                  amount={`${fmtSigned(usage.credits)} credits`}
                  amountClassName="text-red-600"
                  subtitle={formatCurrency(usage.value_idr)}
                  footer={`${usage.count.toLocaleString("en-US")} movements · Dr Deferred / Cr Revenue`}
                  icon={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                      <ArrowUpRight size={16} />
                    </span>
                  }
                />
                <CardRevenueComponent
                  title="Refunded"
                  amount={`${fmtSigned(refund.credits)} credits`}
                  amountClassName="text-blue-600"
                  subtitle={formatCurrency(refund.value_idr)}
                  footer={`${refund.count.toLocaleString("en-US")} movements`}
                  icon={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                      <RotateCcw size={16} />
                    </span>
                  }
                />
                <CardRevenueComponent
                  title="Expired"
                  amount={`${fmtSigned(expired.credits)} credits`}
                  amountClassName="text-zinc-500"
                  subtitle={formatCurrency(expired.value_idr)}
                  footer={`${expired.count.toLocaleString("en-US")} movements · breakage`}
                  icon={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-500/10 text-zinc-500">
                      <Hourglass size={16} />
                    </span>
                  }
                />
                <CardRevenueComponent
                  title="Adjusted"
                  amount={`${fmtSigned(adjustment.credits)} credits`}
                  amountClassName="text-amber-600"
                  subtitle={formatCurrency(adjustment.value_idr)}
                  footer={`${adjustment.count.toLocaleString("en-US")} movements`}
                  icon={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                      <FileText size={16} />
                    </span>
                  }
                />
              </div>
              {Object.keys(byStatus).length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">By status:</span>
                  {Object.entries(byStatus).map(([k, v]) => (
                    <Badge key={k} variant="outline" className={`text-[11px] ${RECOGNITION_CHIP[k] ?? ""}`} title={v.journal}>
                      {k} · {v.count.toLocaleString("en-US")} · {formatCurrency(v.value_idr)}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Row 2: highlighted — Net vs Outstanding (remaining now) */}
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <CardRevenueComponent
                  title="Net Movement"
                  amount={netEmpty ? "0 credits" : `${fmtSigned(summary.net_credits)} credits`}
                  amountClassName={summary.net_credits < 0 ? "text-red-600" : summary.net_credits > 0 ? "text-emerald-600" : undefined}
                  subtitle={netEmpty ? "No net movement in this period" : formatCurrency(summary.net_value_idr)}
                  footer="In minus out for the filtered set. Negative means usage exceeded issuance."
                  icon={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
                      <Activity size={16} />
                    </span>
                  }
                />
                <CardRevenueComponent
                  className="border-primary/30 bg-primary/[0.03] shadow-sm"
                  title="Outstanding · remaining now"
                  amount={out ? `${out.credits.toLocaleString("en-US")} credits` : "—"}
                  subtitle={out ? formatCurrency(out.value_idr) : undefined}
                  footer={
                    out ? (
                      <span className="flex flex-col gap-1">
                        <span>
                          {out.packages.toLocaleString("en-US")} packages still hold credit · advance payments held as a liability ·
                          as of now, not period-end
                        </span>
                        {outstandingAnomaly && (
                          <span className="font-medium text-amber-700">
                            Data anomaly: positive credits with a negative value — shown as returned, flagged for backend.
                          </span>
                        )}
                      </span>
                    ) : (
                      "No outstanding packages in this filter"
                    )
                  }
                  icon={
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Wallet size={16} />
                    </span>
                  }
                />
              </div>
              {(() => {
                // Accrual cards use the period summary (entry_type omitted) — never the table-filtered summary.
                const src = period ?? summary;
                const db = src.deferred_buckets;
                if (!db) return null;
                const sold = db.sold ?? db.terjual;
                const attended = db.recognized_attended ?? db.diakui_hadir;
                const noShow = db.recognized_no_show ?? db.diakui_no_show;
                const ending = db.ending_deferred_balance ?? db.saldo_tangguhan_akhir;
                const total = db.recognized_total ?? db.diakui_total;
                const cash = db.cash;
                if (!sold && !attended && !noShow && !db.breakage && !ending && !cash) return null;
                const creditCards = [
                  {
                    title: "Credit Sold",
                    hint: "Cash received, revenue deferred",
                    journal: sold?.journal,
                    amount: formatCurrency(sold?.value_idr ?? 0),
                    footer: `${(sold?.credits ?? 0).toLocaleString("en-US")} credits · ${sold?.count ?? 0} movements`,
                    icon: (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                        <ShoppingBag size={16} />
                      </span>
                    ),
                  },
                  {
                    title: "Recognized · Attended",
                    hint: "Revenue earned on attendance",
                    journal: attended?.journal,
                    amount: formatCurrency(attended?.value_idr ?? 0),
                    footer: `${(attended?.credits ?? 0).toLocaleString("en-US")} credits · ${attended?.count ?? 0} movements`,
                    icon: (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                        <BadgeCheck size={16} />
                      </span>
                    ),
                  },
                  {
                    title: "Recognized · No-show",
                    hint: "Revenue forfeited on no-show",
                    journal: noShow?.journal,
                    amount: formatCurrency(noShow?.value_idr ?? 0),
                    footer: `${(noShow?.credits ?? 0).toLocaleString("en-US")} credits · ${noShow?.count ?? 0} movements`,
                    icon: (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                        <UserX size={16} />
                      </span>
                    ),
                  },
                  {
                    title: "Breakage · Expired",
                    hint: "Revenue from expired credits",
                    journal: db.breakage?.journal,
                    amount: formatCurrency(db.breakage?.value_idr ?? 0),
                    footer: `${(db.breakage?.credits ?? 0).toLocaleString("en-US")} credits · ${db.breakage?.count ?? 0} movements`,
                    icon: (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-600">
                        <TimerOff size={16} />
                      </span>
                    ),
                  },
                  {
                    title: "Ending Deferred Balance",
                    hint: "Still owed as future sessions (liability)",
                    journal: (ending as unknown as { journal?: string })?.journal,
                    amount: formatCurrency((ending as unknown as { value_idr?: number })?.value_idr ?? 0),
                    footer: `${((ending as unknown as { credits?: number })?.credits ?? 0).toLocaleString("en-US")} credits · ${((ending as unknown as { packages?: number })?.packages ?? 0).toLocaleString("en-US")} packages`,
                    icon: (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
                        <Landmark size={16} />
                      </span>
                    ),
                  },
                ];
                return (
                  <div className="flex flex-col gap-4 rounded-2xl border border-muted bg-muted/20 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold tracking-tight">Revenue Recognition · Accrual</p>
                        <p className="text-[11px] text-muted-foreground">
                          Period totals (entry-type filter omitted) · credit revenue only · cash is a separate bookings
                          query — never add cash and credit counts together
                        </p>
                        {isFiltered && (
                          <p className="text-[11px] text-amber-700">
                            Table is filtered ({filterEntry}); cards below still show full-period accrual.
                          </p>
                        )}
                      </div>
                      {total && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-medium">
                          Total credit revenue · {formatCurrency(total.value_idr)}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {creditCards.map((c) => (
                        <CardRevenueComponent
                          key={c.title}
                          title={c.title}
                          amount={c.amount}
                          subtitle={c.hint}
                          footer={
                            <span className="flex flex-col gap-0.5">
                              <span>{c.footer}</span>
                              {c.journal && <span className="font-mono text-[10px]">{c.journal}</span>}
                            </span>
                          }
                          icon={c.icon}
                        />
                      ))}
                    </div>
                    {cash && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-muted-foreground">Cash flow · same dates, bookings-based</p>
                          <p className="text-[11px] text-muted-foreground">Recognized attended + no-show ≤ sold; the gap is sessions not yet ended.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <CardRevenueComponent
                            title="Cash Sold"
                            amount={formatCurrency(cash.sold?.value_idr ?? 0)}
                            subtitle="Cash collected in period"
                            footer={
                              <span className="flex flex-col gap-0.5">
                                <span>{(cash.sold?.count ?? 0).toLocaleString("en-US")} bookings</span>
                                {cash.sold?.journal && <span className="font-mono text-[10px]">{cash.sold.journal}</span>}
                              </span>
                            }
                            icon={
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-600">
                                <DollarSign size={16} />
                              </span>
                            }
                          />
                          <CardRevenueComponent
                            title="Cash Recognized · Attended"
                            amount={formatCurrency(cash.recognized_attended?.value_idr ?? 0)}
                            subtitle="Cash revenue earned"
                            footer={
                              <span className="flex flex-col gap-0.5">
                                <span>{(cash.recognized_attended?.count ?? 0).toLocaleString("en-US")} bookings</span>
                                {cash.recognized_attended?.journal && (
                                  <span className="font-mono text-[10px]">{cash.recognized_attended.journal}</span>
                                )}
                              </span>
                            }
                            icon={
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                <BadgeDollarSign size={16} />
                              </span>
                            }
                          />
                          <CardRevenueComponent
                            title="Cash Recognized · No-show"
                            amount={formatCurrency(cash.recognized_no_show?.value_idr ?? 0)}
                            subtitle="Cash revenue forfeited"
                            footer={
                              <span className="flex flex-col gap-0.5">
                                <span>{(cash.recognized_no_show?.count ?? 0).toLocaleString("en-US")} bookings</span>
                                {cash.recognized_no_show?.journal && (
                                  <span className="font-mono text-[10px]">{cash.recognized_no_show.journal}</span>
                                )}
                              </span>
                            }
                            icon={
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                                <UserX size={16} />
                              </span>
                            }
                          />
                        </div>
                      </div>
                    )}
                    {total?.journal && (
                      <p className="text-[11px] text-muted-foreground">Journal (credit total): {total.journal}</p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        );
      })()}

      <Card className="overflow-hidden min-w-0 max-w-full">
        <CardContent className="pt-6 min-w-0 max-w-full overflow-hidden">
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <p className="font-medium">Failed to load ledger</p>
              <p className="text-xs">
                {(error as unknown as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
                  (error as Error)?.message ??
                  "Check GET /admin/credits/ledger with the current filters."}
              </p>
              <p className="text-xs mt-2">Fallback: try the Outstanding Detail snapshot in the Preview tab.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 min-w-0 max-w-full">
              <div className="overflow-x-auto max-w-full">
                <CustomTable headers={headers} data={(data?.data as ICreditsLedgerItem[]) ?? []} />
              </div>
              <CustomPagination
                currentPage={data?.pagination?.page ?? page}
                totalItems={data?.pagination?.total_items ?? 0}
                totalPages={data?.pagination?.total_pages ?? 0}
                limit={data?.pagination?.page_size ?? pageSize}
                hasNextPage={data?.pagination?.has_next ?? false}
                hasPrevPage={data?.pagination?.has_prev ?? false}
                onPageChange={setPage}
                showTotal
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OutstandingReportsList({ year, visible }: { year?: number; visible: boolean }) {
  const { data, isLoading } = useListOutstandingReports({ year, page: 1, page_size: 20 }, visible);
  const items = (
    data as unknown as {
      data?: {
        report_id: string;
        period: string;
        summary_file: { download_url: string; file_name: string };
        detail_file: { download_url: string; file_name: string };
        generated_at: string;
      }[];
    }
  )?.data as unknown as
    | {
        report_id: string;
        period: string;
        summary_file: { download_url: string; file_name: string };
        detail_file: { download_url: string; file_name: string };
        generated_at: string;
      }[]
    | undefined;
  const list = Array.isArray(items)
    ? items
    : (items as unknown as { data?: unknown })
    ? []
    : ((data as unknown as { data?: unknown[] })?.data as unknown[]) ?? [];
  if (!visible) return null;
  return (
    <Card className="mt-4">
      <CardHeader className="text-base font-semibold">Previous Reports {year ? `(${year})` : ""} — GET /admin/credits/outstanding/reports</CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : !list || (list as unknown[]).length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports found{year ? ` for ${year}` : ""}. Generate one above.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {(
              list as {
                report_id: string;
                period: string;
                summary_file: { download_url: string; file_name: string };
                detail_file: { download_url: string; file_name: string };
                generated_at: string;
                is_incomplete?: boolean;
              }[]
            ).map((r) => (
              <div key={r.report_id} className="flex items-center justify-between rounded border p-3 text-sm">
                <div>
                  <p className="font-medium">{r.period}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateHelper(r.generated_at)} {r.is_incomplete ? "(incomplete)" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.summary_file?.download_url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={r.summary_file.download_url} download>
                        <Download className="h-3 w-3" /> Summary
                      </a>
                    </Button>
                  )}
                  {r.detail_file?.download_url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={r.detail_file.download_url} download>
                        <Download className="h-3 w-3" /> Detail
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ReportDownloadsProps {
  detailLink?: string;
  summaryLink?: string;
  isLoading?: boolean;
  summaryFileName?: string;
  detailFileName?: string;
  month?: string;
  year?: string;
}

export function ReportDownloads({ detailLink, summaryLink, isLoading = false, summaryFileName, detailFileName, month, year }: ReportDownloadsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">
          Your Reports for {MONTH_LIST.find((p) => p.value === month)?.label} {year} Are Ready
        </h3>
        <p className="text-sm text-muted-foreground">Download your generated reports below</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Detail Report Card */}
        {detailLink && (
          <Card className="flex flex-col gap-4 border-2  p-6 transition-all hover:border-brand-500 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Detail Report</h4>
                <p className="text-xs text-muted-foreground">{detailFileName}</p>
              </div>
            </div>
            <Button asChild disabled={isLoading} className="w-full gap-2">
              <a href={detailLink} download>
                <Download className="h-4 w-4" />
                Download Detail
              </a>
            </Button>
          </Card>
        )}

        {/* Summary Report Card */}
        {summaryLink && (
          <Card className="flex flex-col gap-4 border-2  p-6 transition-all hover:border-brand-500 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Summary Report</h4>
                <p className="text-xs text-muted-foreground">{summaryFileName}</p>
              </div>
            </div>
            <Button asChild disabled={isLoading} className="w-full gap-2" variant={"secondary"}>
              <a href={summaryLink} download>
                <Download className="h-4 w-4" />
                Download Summary
              </a>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
