"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { BackButtonComponent } from "@/components/general/back-button";
import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { InstructorPaymentDetailComponent } from "@/components/page/instructor-payment/payment-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTH_LIST, YEAR_LIST } from "@/constants/sample-data";
import { useExportInstructorPayment } from "@/hooks/api/mutations/admin";
import { useGetInstructor } from "@/hooks/api/queries/admin/instructor/use-get-instructor";
import { useGetInstructorPaymentDetails } from "@/hooks/api/queries/admin/instructor/use-get-instructor-payment-details";
import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { ISessionInstructorPayment } from "@/types/instructor.interface";
import { EyeIcon, File, Search } from "lucide-react";
import { useState } from "react";
import ReactSelect from "react-select";
import { toast } from "sonner";

// Payroll period: 24th previous month → 23rd selected month (same as instructor detail export dialog)
const getPayrollPeriod = (year: number, month: number) => {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${prevYear}-${pad(prevMonth)}-24`;
  const end = `${year}-${pad(month)}-23`;
  const display = `${formatDateHelper(start, "dd MMM")} - ${formatDateHelper(end, "dd MMM yyyy")}`;
  return { start, end, display };
};

interface InstructorOption {
  value: string;
  label: string;
}

export const TeacherReportView = () => {
  const [instructor, setInstructor] = useState<InstructorOption | null>(null);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [draftRange, setDraftRange] = useState<{ startDate?: string | null; endDate?: string | null }>({
    startDate: defaultDate().formattedOneMonthAgo,
    endDate: defaultDate().formattedToday,
  });
  const [applied, setApplied] = useState<{ id: string; name: string; startDate: string; endDate: string } | null>(null);
  const [page, setPage] = useState(1);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const [groupBy, setGroupBy] = useState<"student" | "session">("student");
  const [openExport, setOpenExport] = useState(false);
  const [exportRange, setExportRange] = useState<{ startDate?: string | null; endDate?: string | null }>({
    startDate: defaultDate().formattedOneMonthAgo,
    endDate: defaultDate().formattedToday,
  });
  const [exportYear, setExportYear] = useState<string>("");
  const [exportMonth, setExportMonth] = useState<string>("");

  const { data: instructorData, isLoading: instructorLoading } = useGetInstructor({ page: 1, limit: 50, search: instructorSearch || undefined });
  const instructorOptions: InstructorOption[] =
    instructorData?.data?.map((i) => ({ value: i.id, label: `${i.full_name}${i.email ? ` - ${i.email}` : ""}` })) ?? [];

  // Same table source as the Class & Payment tab
  const {
    data: payments,
    isLoading: loadingPayments,
    isFetching,
  } = useGetInstructorPaymentDetails(
    {
      id: applied?.id,
      startDate: applied?.startDate,
      endDate: applied?.endDate,
      page,
      limit: 10,
    },
    applied ? "payment" : "",
  );

  const { mutateAsync: exportPayment, isPending } = useExportInstructorPayment();
  const payoutPeriod = exportYear && exportMonth ? getPayrollPeriod(Number(exportYear), Number(exportMonth)) : null;

  const handleOpenModalDetail = (id: string | null) => {
    setOpenDetail(true);
    setSelectedPayment(id);
  };

  const handlePreview = () => {
    if (!instructor) {
      toast.error("Pilih instructor dulu");
      return;
    }
    setPage(1);
    setApplied({
      id: instructor.value,
      name: instructor.label,
      startDate: draftRange.startDate ?? defaultDate().formattedOneMonthAgo,
      endDate: draftRange.endDate ?? defaultDate().formattedToday,
    });
  };

  const handleOpenExport = () => {
    if (!applied) return;
    setExportRange({ startDate: applied.startDate, endDate: applied.endDate });
    setOpenExport(true);
  };

  const onExportPayment = async () => {
    if (!applied) return;
    try {
      const useYearMonth = !!exportYear && !!exportMonth;
      const payload = {
        id: applied.id,
        ...(useYearMonth ? { year: Number(exportYear), month: Number(exportMonth) } : { start_date: exportRange?.startDate ?? applied.startDate, end_date: exportRange?.endDate ?? applied.endDate }),
        group_by: groupBy,
      } as unknown as import("@/types/instructor.interface").IPayloadExport;
      const blob = await exportPayment(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const periodLabel = useYearMonth ? `${exportYear}-${String(exportMonth).padStart(2, "0")} (${payoutPeriod?.display})` : `${exportRange?.startDate}_${exportRange?.endDate}`;
      a.download = `[${applied.name.split(" - ")[0]}] Payment-${groupBy}-${periodLabel}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setOpenExport(false);
      setExportYear("");
      setExportMonth("");
    } catch (error) {
      console.log(error);
    }
  };

  // Same columns as the Class & Payment tab
  const headers = [
    { id: "sessions_name", text: "Sessions", value: "session_name" },
    { id: "class_name", text: "Class", value: "class_name" },
    { id: "session_date", text: "Date", value: (row: ISessionInstructorPayment) => formatDateHelper(row.session_date, "dd/MM/yyyy") },
    { id: "payment_model", text: "Payment Model", value: (row: ISessionInstructorPayment) => <p className="capitalize">{row.payment_model}</p> },
    { id: "session_type", text: "Session Type", value: (row: ISessionInstructorPayment) => <p className="capitalize">{row.session_type}</p> },
    { id: "session_place", text: "Session Type", value: (row: ISessionInstructorPayment) => <p className="capitalize">{row.session_place ?? "-"}</p> },
    { id: "calculated_payment", text: "Total Payment", value: (row: ISessionInstructorPayment) => formatCurrency(row.calculated_payment) },
    { id: "payment_revenue", text: "Total Revenue", value: (row: ISessionInstructorPayment) => formatCurrency(row.total_revenue) },
  ];

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: ISessionInstructorPayment) => (
      <Button variant={"outline"} size={"icon"} onClick={() => handleOpenModalDetail(row.session_id)}>
        <EyeIcon />
      </Button>
    ),
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <BackButtonComponent page="/admin/report">
        <span className="text-sm font-medium text-gray-500">Back to Reports</span>
      </BackButtonComponent>
      <Card>
        <CardHeader className="flex w-full flex-col gap-3">
          <div className="flex flex-col">
            <h3 className="text-2xl font-semibold">Teacher Report</h3>
            <p className="text-sm text-gray-500">Track completed classes and related payment details per instructor.</p>
          </div>
          <div className="flex w-full flex-row flex-wrap items-end gap-2">
            <div className="flex min-w-64 flex-1 flex-col gap-1">
              <p className="text-sm font-medium">Instructor</p>
              <ReactSelect
                isClearable
                isLoading={instructorLoading}
                placeholder="Pilih instructor..."
                value={instructor}
                options={instructorOptions}
                onInputChange={(v) => setInstructorSearch(v)}
                inputValue={instructorSearch}
                onChange={(opt) => setInstructor(opt as InstructorOption | null)}
                classNames={{
                  control: () => "!min-h-[40px] !border-input !bg-background",
                  placeholder: () => "text-muted-foreground",
                  singleValue: () => "text-foreground",
                }}
                styles={{ control: (base) => ({ ...base, minHeight: 40, borderRadius: 6 }) }}
              />
            </div>
            <DateRangePicker
              mode="range"
              onDateRangeChange={(startDate, endDate) => setDraftRange({ startDate, endDate })}
              startDate={draftRange?.startDate ?? undefined}
              endDate={draftRange?.endDate ?? undefined}
              allowFutureDates
              allowPastDates
            />
            <Button onClick={handlePreview} disabled={!instructor}>
              <Search className="h-4 w-4" /> Preview
            </Button>
            <Button variant={"outline"} onClick={handleOpenExport} disabled={!applied || isPending}>
              <File /> Export
            </Button>
          </div>
          {applied && (
            <Badge variant="outline" className="w-fit bg-muted/30">
              {applied.name} • {formatDateHelper(applied.startDate, "dd MMM yyyy")} - {formatDateHelper(applied.endDate, "dd MMM yyyy")}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {!applied ? (
              <p className="text-sm text-muted-foreground">Pilih instructor dan rentang tanggal, lalu klik Preview untuk melihat laporan.</p>
            ) : (
              <>
                <CustomTable headers={headers} data={payments?.data?.sessions ?? []} isLoading={isFetching || loadingPayments} actionOptions={actionOptions} />
                <CustomPagination
                  onPageChange={(e) => setPage(e)}
                  currentPage={page}
                  showTotal
                  hasPrevPage={payments?.data?.pagination.has_prev}
                  hasNextPage={payments?.data?.pagination?.has_next}
                  totalItems={payments?.data?.pagination?.total_items as number}
                  totalPages={payments?.data?.pagination?.total_pages as number}
                  limit={10}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {openExport && (
        <BaseDialogComponent isOpen={openExport} title="Export Payment" btnConfirm="Export" onClose={() => setOpenExport(false)} onConfirm={onExportPayment} isDisabled={!!isPending}>
          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground bg-muted/30 rounded-md p-2">
              Default <span className="font-medium">By Student</span> (student rows with pro-rata fee). <span className="font-medium">24 prev → 23 current month</span> when Year/Month is set
              (e.g., Aug 2026 = 24 Jul – 23 Aug). Leave Year/Month empty to use custom date range.
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Group by</p>
              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "student" | "session")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="student">By Student (detailed rows, fee pro-rata)</SelectItem>
                    <SelectItem value="session">By Session (aggregated per session)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Year</p>
                <Select value={exportYear} onValueChange={(v) => setExportYear(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All — use date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All — use date range</SelectItem>
                      {YEAR_LIST.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Month</p>
                <Select value={exportMonth} onValueChange={(v) => setExportMonth(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All — use date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All — use date range</SelectItem>
                      {MONTH_LIST.map((m) => (
                        <SelectItem key={m.value} value={String(m.value)}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {payoutPeriod && (
              <Badge variant="outline" className="w-fit bg-muted/30">
                {payoutPeriod.display} • {payoutPeriod.start} to {payoutPeriod.end}
              </Badge>
            )}
            {(!exportYear || !exportMonth) && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Custom date range (fallback)</p>
                <DateRangePicker
                  mode="range"
                  startDate={exportRange.startDate ?? undefined}
                  endDate={exportRange.endDate ?? undefined}
                  onDateRangeChange={(startDate, endDate) => setExportRange({ startDate, endDate })}
                  allowPastDates
                  allowFutureDates
                />
                <p className="text-xs text-muted-foreground">Used only when Year/Month not both set.</p>
              </div>
            )}
          </div>
        </BaseDialogComponent>
      )}
      {openDetail && selectedPayment && (
        <InstructorPaymentDetailComponent
          id={selectedPayment as string}
          isOpen={openDetail}
          onClose={() => {
            setOpenDetail(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};
