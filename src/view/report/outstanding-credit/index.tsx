/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MONTH_LIST, YEAR_LIST } from "@/constants/sample-data";
import { exportCreditsLedger } from "@/api-req/report";
import { useGenerateOutstandingReport } from "@/hooks/api/mutations/admin";
import { useGetCreditsLedger } from "@/hooks/api/queries/admin/report/outstanding-credit/use-get-credits-ledger";
import { useGetCreditsLedgerSummary } from "@/hooks/api/queries/admin/report/outstanding-credit/use-get-credits-ledger-summary";
import { useGetOutstandingCreditTable } from "@/hooks/api/queries/admin/report/outstanding-credit";
import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { ICreditsLedgerItem, ICreditsLedgerSummary, IGeenrateOutstandingResponse, IPackage, LedgerEntryType } from "@/types/report.interface";
import { BadgeDollarSign, DollarSign, Download, FileText, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useGetCustomers } from "@/hooks/api/queries/admin/customers";
import { useDebounce } from "@/hooks";
import ReactSelect from "react-select";

// •⁠  ⁠Active: Green
// •⁠  ⁠Not Started: Gray
// •⁠  ⁠Expiring Soon: Orange
// •⁠  ⁠Fully Used: Blue
// •⁠  ⁠Expired: Red

const PACKAGE_STATUS = {
  active: {
    label: "Active",
    color: "green-500",
  },

  not_started: {
    label: "Not Started",
    color: "gray-400",
  },

  expiring_soon: { label: "Expires Soon", color: "yellow-200" },
  fully_used: { label: "Fully Used", color: "blue-800" },
  expired: { label: "Expired", color: "red-500" },
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
  const [selectedRange, setSelectedRange] = useState({
    from: defaultDate().formattedTwoWeeksBefore,
    to: defaultDate().formattedToday,
  });

  // sync tab to URL ?view=log feature flag; snapshot export uses ?subview=export (snapshot is default, so ?view absent)
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    if (tabs === "log") {
      p.set("view", "log");
      p.delete("subview");
    } else {
      p.delete("view");
      if (snapshotTab === "export") p.set("subview", "export");
      else p.delete("subview");
    }
    const qs = p.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false } as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, snapshotTab]);

  const formField = methods.watch();

  const [generatedFile, setGeneratedFile] = useState<IGeenrateOutstandingResponse | null>(null);

  const { data, isLoading, refetch, isFetching, isSuccess } = useGetOutstandingCreditTable({
    startDate: selectedRange.from,
    endDate: selectedRange.to,
  });

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };

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
      value: (row: IPackage) => (
        <Badge className={`bg-${(PACKAGE_STATUS as any)[row.package_status].color} text-brand-999`}>
          {(PACKAGE_STATUS as any)[row.package_status].label}
        </Badge>
      ),
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
      value: (row: IPackage) => formatCurrency(row.outstanding_value_idr),
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
    <div className="flex flex-col gap-4">
      <GeneralTabComponent tabs={tabOption} selecetedTab={tabs} setTab={setTabs} />
      {tabs === "snapshot" && (
        <div className="flex flex-col gap-4">
          <GeneralTabComponent tabs={snapshotTabOption} selecetedTab={snapshotTab} setTab={setSnapshotTab} variant="line" />
          {snapshotTab === "preview" && (
            <>
              <Card>
                <CardHeader className="text-2xl font-semibold">Preview Outstanding Credit</CardHeader>
                <CardContent>
                  <div className="flex flex-row items-center w-full">
                    <div className="flex flex-col gap-4 w-full">
                      <div className="w-full flex flex-col gap-1">
                        <p className="text-sm font-medium">Date From</p>
                        <DateRangePicker
                          mode="range"
                          onDateRangeChange={handleDateRangeChangeDual}
                          startDate={selectedRange.from}
                          endDate={selectedRange.to}
                          allowPastDates
                          maxSelectionDays={14}
                        />
                      </div>
                      <div className="flex justify-end items-end w-full">
                        <Button
                          onClick={() => {
                            refetch();
                          }}
                        >
                          Generate Table
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {isLoading && isFetching ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {data?.data && (
                    <div className="flex flex-col gap-4 pt-4 w-full">
                      <div className="flex flex-row items-center w-full gap-4">
                        <div className="w-full">
                          <CardRevenueComponent
                            amount={`${String(data?.data?.summary?.totals.total_credits_remaining)} / ${String(
                              data?.data?.summary?.totals.total_credits_purchased,
                            )}`}
                            title="Total Credit Remaining"
                            icon={
                              <BadgeDollarSign
                                style={{
                                  color: "var(--color-gray-400)",
                                }}
                                size={18}
                              />
                            }
                          />
                        </div>
                        <div className="w-full">
                          <CardRevenueComponent
                            amount={formatCurrency(String(data?.data?.summary?.totals.total_outstanding_value_idr))}
                            title="Oustanding Value (IDR)"
                            icon={
                              <DollarSign
                                style={{
                                  color: "var(--color-gray-400)",
                                }}
                                size={18}
                              />
                            }
                          />
                        </div>
                      </div>
                      <Card>
                        <CardHeader className="text-lg font-semibold">
                          Outstanding Credit {selectedRange.from} to {selectedRange?.to}
                        </CardHeader>
                        <CardContent>
                          <CustomTable headers={headers} data={data?.data.packages ?? []} />
                        </CardContent>
                      </Card>
                    </div>
                  )}
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
};

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
    return list.find((m) => m.id === userId) ?? { id: userId, full_name: "Selected member", phone: "" } as unknown as { id: string; full_name: string; phone: string };
  }, [userId, memberData]);

  // debounce q (package name only)
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput), 400);
    return () => clearTimeout(t);
  }, [qInput]);

  // reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [q, entryTypes, startDate, endDate, order, userId]);

  // persist to URL
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("view", "log");
    if (q) p.set("q", q);
    else p.delete("q");
    if (entryTypes.length) p.set("entry_type", entryTypes.join(","));
    else p.delete("entry_type");
    if (startDate) p.set("start_date", startDate);
    if (endDate) p.set("end_date", endDate);
    p.set("page", String(page));
    p.set("page_size", String(pageSize));
    p.set("order", order);
    if (userId) p.set("user_id", userId);
    router.replace(`?${p.toString()}`, { scroll: false } as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, entryTypes, startDate, endDate, page, pageSize, order]);

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
      start_date: !rangeError ? startDate : undefined,
      end_date: !rangeError ? endDate : undefined,
      page,
      page_size: pageSize,
      order,
      user_id: userId || undefined,
    }),
    [q, entryTypes, startDate, endDate, page, pageSize, order, userId, rangeError],
  );

  const { data, isLoading, isFetching, isError, error } = useGetCreditsLedger(params);

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
  const { data: summaryRes, isLoading: summaryLoading } = useGetCreditsLedgerSummary(summaryParams, !rangeError);

  const [exporting, setExporting] = useState(false);

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

  const toggleEntryType = (v: string) =>
    setEntryTypes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const headers = useMemo(
    () => [
      {
        id: "created_at_wib",
        text: "Time (WIB)",
        value: (row: ICreditsLedgerItem) => row.created_at_wib || formatDateHelper(row.created_at, "dd MMM yyyy HH:mm") + " WIB",
      },
      {
        id: "entry_type",
        text: "Type",
        value: (row: ICreditsLedgerItem) => (
          <Badge variant="outline" className={`capitalize text-xs ${ENTRY_TYPE_CHIP[row.entry_type] ?? ""}`}>
            {row.entry_type.replace("credit_", "")}
          </Badge>
        ),
      },
      {
        id: "amount",
        text: "Amount",
        value: (row: ICreditsLedgerItem) =>
          row.amount == null ? (
            "-"
          ) : (
            <span className={row.amount < 0 ? "text-red-600 font-semibold" : row.amount > 0 ? "text-green-600 font-semibold" : ""}>
              {row.amount > 0 ? `+${row.amount}` : row.amount}
            </span>
          ),
      },
      {
        id: "unit_value_idr",
        text: "Unit Value (IDR)",
        value: (row: ICreditsLedgerItem) =>
          row.unit_value_idr == null ? (
            "-"
          ) : (
            <span className={row.amount < 0 ? "text-red-600 font-semibold" : row.amount > 0 ? "text-green-600 font-semibold" : ""}>
              {formatCurrency(row.unit_value_idr)}
            </span>
          ),
      },
      {
        id: "total_value_idr",
        text: "Total Value (IDR)",
        value: (row: ICreditsLedgerItem) =>
          row.total_value_idr == null ? (
            "-"
          ) : (
            <span className={row.amount < 0 ? "text-red-600 font-semibold" : row.amount > 0 ? "text-green-600 font-semibold" : ""}>
              {formatCurrency(row.total_value_idr)}
            </span>
          ),
      },
      {
        id: "balance_credits",
        text: "Balance (Credits)",
        value: (row: ICreditsLedgerItem) =>
          row.balance_before_credits == null && row.balance_after_credits == null ? "-" : `${row.balance_before_credits ?? "-"} → ${row.balance_after_credits ?? "-"}`,
      },
      {
        id: "balance_value",
        text: "Balance Value (IDR)",
        value: (row: ICreditsLedgerItem) =>
          row.balance_before_value_idr == null && row.balance_after_value_idr == null
            ? "-"
            : `${row.balance_before_value_idr == null ? "-" : formatCurrency(row.balance_before_value_idr)} → ${row.balance_after_value_idr == null ? "-" : formatCurrency(row.balance_after_value_idr)}`,
      },
      {
        id: "package",
        text: "Package",
        value: (row: ICreditsLedgerItem) => row.package_purchase?.package_name ?? "-",
      },
      {
        id: "booking",
        text: "Booking / Session",
        value: (row: ICreditsLedgerItem) => {
          if (!row.booking) return "-";
          const isSpendNoAttendance = row.entry_type === "credit_spend" && !row.booking.attendance_status;
          const sessionName = row.booking.class_session?.session_name ?? "-";
          const sessionDate = row.booking.class_session?.start_datetime
            ? formatDateHelper(row.booking.class_session.start_datetime, "dd MMM yyyy HH:mm")
            : "-";
          const content = (
            <span className="flex flex-col">
              <span className="font-medium">{sessionName}</span>
              <span className="text-xs text-muted-foreground">{sessionDate}</span>
            </span>
          );
          if (!isSpendNoAttendance) return content;
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help underline decoration-dotted">{content}</span>
                </TooltipTrigger>
                <TooltipContent>Credit was deducted at booking; attendance not yet recorded</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        id: "customer",
        text: "Customer",
        value: (row: ICreditsLedgerItem) => (row.customer ? `${row.customer.full_name} (${row.customer.phone})` : "-"),
      },
      {
        id: "note",
        text: "Note",
        value: (row: ICreditsLedgerItem) => row.note ?? "-",
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="text-lg font-semibold">Credit Movement Log (credits_ledger)</CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* filters — q is package name only; customer filter via user_id member select */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="flex flex-col gap-1 md:col-span-4">
              <p className="text-sm font-medium">Search package</p>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search package name..." value={qInput} onChange={(e) => setQInput(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-3">
              <p className="text-sm font-medium">Start Date</p>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1 md:col-span-3">
              <p className="text-sm font-medium">End Date</p>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
                  ? { value: (selectedMember as unknown as { id: string }).id, label: `${(selectedMember as unknown as { full_name: string }).full_name} - ${(selectedMember as unknown as { phone: string }).phone ?? ""}`, id: (selectedMember as unknown as { id: string }).id } as unknown as never
                  : null
              }
              options={
                (memberData?.data as unknown as { id: string; full_name: string; phone: string }[] | undefined)?.map((m) => ({
                  value: m.id,
                  label: `${m.full_name} - ${m.phone ?? ""}`,
                  id: m.id,
                } as unknown as never)) ?? []
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
            <p className="text-xs text-muted-foreground">Filters ledger by member via <code>user_id</code>; package search uses <code>q</code>.</p>
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

          {rangeError && <p className="text-sm text-red-600">{rangeError}</p>}

          <div className="flex justify-end pt-2">
            <Button onClick={handleExportCsv} disabled={!!rangeError || exporting} variant="outline" size="sm">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI header from GET /admin/credits/ledger/summary — no pagination, whole filtered set — English copy */}
      {(() => {
        const s = (summaryRes as unknown as { data?: ICreditsLedgerSummary | { data: ICreditsLedgerSummary } })?.data as unknown as ICreditsLedgerSummary | undefined;
        const summary = (s as unknown as { data?: ICreditsLedgerSummary })?.data ?? s;
        if (summaryLoading) {
          return (
            <Card>
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
        const out = summary.outstanding ?? (summary.outstanding_credits != null ? { packages: summary.outstanding_packages ?? 0, credits: summary.outstanding_credits ?? 0, value_idr: summary.outstanding_value_idr ?? 0 } : null);
        const netEmpty = summary.net_credits === 0 && summary.net_value_idr === 0;
        return (
          <Card className="border-muted-foreground/10">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold tracking-tight">Summary</h3>
                <p className="text-xs text-muted-foreground">Period: {summary.periode} · {summary.total_movements.toLocaleString("id-ID")} movements</p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Row 1: 4 cards — by_type breakdown */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">Issuance</p>
                  <p className="mt-1 text-xs text-muted-foreground">credit_issue</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-600">{issuance.credits > 0 ? `+${issuance.credits}` : issuance.credits} credits</p>
                  <p className="text-sm font-medium text-emerald-600">{formatCurrency(issuance.value_idr)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{issuance.count} transactions</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">Usage</p>
                  <p className="mt-1 text-xs text-muted-foreground">credit_spend</p>
                  <p className="mt-2 text-lg font-semibold text-red-600">{usage.credits} credits</p>
                  <p className="text-sm font-medium text-red-600">{formatCurrency(usage.value_idr)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{usage.count} transactions</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">Refund</p>
                  <p className="mt-1 text-xs text-muted-foreground">credit_refund</p>
                  <p className="mt-2 text-lg font-semibold text-blue-600">{refund.credits > 0 ? `+${refund.credits}` : refund.credits} credits</p>
                  <p className="text-sm font-medium text-blue-600">{formatCurrency(refund.value_idr)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{refund.count} transactions</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs font-medium text-muted-foreground">Expired</p>
                  <p className="mt-1 text-xs text-muted-foreground">credit_expired</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-500">{expired.credits} credits</p>
                  <p className="text-sm font-medium text-zinc-500">{formatCurrency(expired.value_idr)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{expired.count} transactions</p>
                </div>
              </div>

              {/* Row 2: highlighted — Net vs Outstanding */}
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Net Movement</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help rounded-full border px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">?</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[320px] text-xs leading-relaxed">
                          Issuance + Usage + Refund + Expired in period {summary.periode}. Negative = usage greater than issuance (liability decreased, revenue recognized).
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {netEmpty ? (
                    <p className="mt-2 text-sm text-muted-foreground">No net movement in this period.</p>
                  ) : (
                    <>
                      <p className={`mt-2 text-lg font-semibold ${summary.net_credits < 0 ? "text-red-600" : summary.net_credits > 0 ? "text-emerald-600" : ""}`}>{summary.net_credits > 0 ? `+${summary.net_credits}` : summary.net_credits} credits</p>
                      <p className={`text-sm font-medium ${summary.net_value_idr < 0 ? "text-red-600" : summary.net_value_idr > 0 ? "text-emerald-600" : ""}`}>{formatCurrency(summary.net_value_idr)}</p>
                    </>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Net = total in-out in the filtered period.</p>
                </div>
                <div className="rounded-xl border-2 bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Outstanding (Remaining)</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help rounded-full border px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">?</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[320px] text-xs leading-relaxed">
                          Remaining credits still available now (as of now) for packages that appear in this filter. Different from net — this is advance received liability.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {out ? (
                    <>
                      <p className="mt-2 text-lg font-semibold">{out.credits.toLocaleString("id-ID")} credits</p>
                      <p className="text-sm font-medium">{formatCurrency(out.value_idr)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{out.packages.toLocaleString("id-ID")} packages</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">—</p>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Outstanding = remaining still active now.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <Card>
        <CardContent className="pt-6">
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {/* BE not yet deployed — show spec shape hint */}
              <p className="font-medium">Failed to load log</p>
              <p className="text-xs">{(error as unknown as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? (error as Error)?.message ?? "Endpoint /admin/credits/ledger not yet available. Use ?view=log for mock."}</p>
              <p className="text-xs mt-2">Fallback: try the Outstanding Detail snapshot in the Preview tab.</p>
            </div>
          ) : (
            <>
              <CustomTable headers={headers} data={(data?.data as ICreditsLedgerItem[]) ?? []} />
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
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
