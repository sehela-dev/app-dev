"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { CustomTable } from "@/components/general/custom-table";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Badge } from "@/components/ui/badge";
import { useGetInstructorDetail } from "@/hooks/api/queries/admin/instructor";
import { useGetInstructorPaymentDetails } from "@/hooks/api/queries/admin/instructor/use-get-instructor-payment-details";
import { defaultDate, formatDateHelper, formatCurrency } from "@/lib/helper";
import { File, ListFilter, Loader2, PenIcon, Receipt, ChevronDown, ChevronUp, EyeIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { IModelParams, IPaymentRuleResponse, ISessionInstructorPayment } from "@/types/instructor.interface";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTH_LIST, YEAR_LIST } from "@/constants/sample-data";
import { CustomPagination } from "@/components/general/pagination-component";
import { useExportInstructorPayment, useGenerateMonthlyReport } from "@/hooks/api/mutations/admin";
import { useGetTeacherReports } from "@/hooks/api/queries/admin/instructor";
import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { InstructorPaymentDetailComponent } from "@/components/page/instructor-payment/payment-details";
import { previewMonthlyReport } from "@/api-req/instructor";

const instructorTabs = [
  {
    value: "basic",
    name: "Information",
  },
  {
    value: "payment",
    name: "Class & Payment",
  },
  {
    value: "report",
    name: "Payroll Report",
  },
];

const getPayrollPeriod = (year: number, month: number) => {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${prevYear}-${pad(prevMonth)}-24`;
  const end = `${year}-${pad(month)}-23`;
  const display = `${formatDateHelper(start, "dd MMM")} - ${formatDateHelper(end, "dd MMM yyyy")}`;
  return { start, end, display };
};

const PAYMENT_MODEL_LABELS: Record<string, string> = {
  percentage: "Percentage",
  percentage_with_min: "Percentage with Minimum",
  fixed: "Fixed Rate",
  tiered: "Tiered",
  source_based: "Source Based",
  per_person_with_min: "Per Person with Minimum",
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  regular_offline: "Regular - Offline",
  regular_online: "Regular - Online",
  private: "Private",
  special: "Special",
};

export const InstructorDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetInstructorDetail(id as string);
  const [page, setPage] = useState(1);
  const [tabs, setTabs] = useState("basic");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [selectedRange, setSelectedRange] = useState<{ startDate?: string | null; endDate?: string | null }>({
    startDate: defaultDate().formattedOneMonthAgo,
    endDate: defaultDate().formattedToday,
  });
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const [groupBy, setGroupBy] = useState<"student" | "session">("session");
  const [openExport, setOpenExport] = useState(false);
  const [exportRange, setExportRange] = useState<{ startDate?: string | null; endDate?: string | null }>({
    startDate: defaultDate().formattedOneMonthAgo,
    endDate: defaultDate().formattedToday,
  });

  const handleOpenModalDetail = (id: string | null) => {
    setOpenDetail(true);
    setSelectedPayment(id);
  };
  const handleDateRangeChangeDual = (startDate?: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, startDate: startDate as string, endDate: endDate as string }));
    refetch();
  };
  const handleExportRangeChange = (startDate?: string, endDate?: string) => {
    setExportRange({ startDate: startDate as string, endDate: endDate as string });
  };
  const handleOpenExport = () => {
    setExportRange({ startDate: selectedRange.startDate ?? defaultDate().formattedOneMonthAgo, endDate: selectedRange.endDate ?? defaultDate().formattedToday });
    setOpenExport(true);
  };
  const { mutateAsync: exportPayment, isPending } = useExportInstructorPayment();
  const { mutateAsync: generateReport, isPending: isGenerating } = useGenerateMonthlyReport();
  const [reportMonth, setReportMonth] = useState(Number(formatDateHelper(defaultDate().formattedToday, "M")));
  const [reportYear, setReportYear] = useState(Number(formatDateHelper(defaultDate().formattedToday, "yyyy")));
  const [reportResult, setReportResult] = useState<import("@/types/instructor.interface").IMonthlyReportData | null>(null);
  const [pendingPeriod, setPendingPeriod] = useState<{ canGenerateFrom?: string; message?: string } | null>(null);
  const [reportPage, setReportPage] = useState(1);
  const payrollPeriod = getPayrollPeriod(reportYear, reportMonth);

  useEffect(() => {
    setReportResult(null);
    setPendingPeriod(null);
    setReportPage(1);
  }, [reportMonth, reportYear, id]);
  const { data: teacherReports, isFetching: fetchingReports, refetch: refetchReports } = useGetTeacherReports(
    { instructor_id: id as string, year: reportYear, month: reportMonth, page: reportPage, page_size: 10 },
    tabs === "report"
  );
  const {
    data: payments,
    isLoading: loadingPayments,
    isFetching,
    refetch,
  } = useGetInstructorPaymentDetails(
    {
      id: id as string,
      startDate: selectedRange?.startDate ?? undefined,
      endDate: selectedRange?.endDate ?? undefined,
      page,
      limit: 10,
    },
    tabs,
  );

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getSessionKey = (rule: IPaymentRuleResponse) => {
    if (rule.session_type === "regular") {
      return `regular_${rule.session_place}`;
    }
    return rule.session_type;
  };

  const renderModelParams = (paymentModel: string, params: IModelParams) => {
    switch (paymentModel) {
      case "percentage":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Percentage:</span>
              <span className="font-medium">{params.percentage}%</span>
            </div>
          </div>
        );

      case "percentage_with_min":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Percentage:</span>
              <span className="font-medium">{params.percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Minimum Amount:</span>
              <span className="font-medium">{formatCurrency(params.min_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Minimum Students:</span>
              <span className="font-medium">{params.min_threshold_people}</span>
            </div>
          </div>
        );

      case "fixed":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">{formatCurrency(params.amount || 0)}</span>
            </div>
          </div>
        );

      case "tiered":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Base Amount:</span>
              <span className="font-medium">{formatCurrency(params.base_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Base Students:</span>
              <span className="font-medium">{params.base_people}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Additional per Student:</span>
              <span className="font-medium">{formatCurrency(params.additional_per_person || 0)}</span>
            </div>
          </div>
        );

      case "per_person_with_min":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Rate per Person:</span>
              <span className="font-medium">{formatCurrency(params.per_person_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Minimum Amount:</span>
              <span className="font-medium">{formatCurrency(params.min_amount || 0)}</span>
            </div>
          </div>
        );

      case "source_based":
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Credit Rate:</span>
              <span className="font-medium">{formatCurrency(params.credit_rate || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Non-Credit Rate:</span>
              <span className="font-medium">{formatCurrency(params.non_credit_rate || 0)}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const headers = [
    {
      id: "sessions_name",
      text: "Sessions",
      value: "session_name",
    },
    {
      id: "class_name",
      text: "Class",
      value: "class_name",
    },
    {
      id: "session_date",
      text: "Date",
      value: (row: ISessionInstructorPayment) => formatDateHelper(row.session_date, "dd/MM/yyyy"),
    },
    {
      id: "payment_model",
      text: "Payment Model",
      value: (row: ISessionInstructorPayment) => <p className="capitalize">{row.payment_model}</p>,
    },
    {
      id: "session_type",
      text: "Session Type",
      value: (row: ISessionInstructorPayment) => <p className="capitalize">{row.session_type}</p>,
    },
    {
      id: "session_place",
      text: "Session Type",
      value: (row: ISessionInstructorPayment) => <p className="capitalize">{row.session_place ?? "-"}</p>,
    },
    {
      id: "calculated_payment",
      text: "Total Payment",
      value: (row: ISessionInstructorPayment) => formatCurrency(row.calculated_payment),
    },
    {
      id: "payment_revenue",
      text: "Total Revenue",
      value: (row: ISessionInstructorPayment) => formatCurrency(row.total_revenue),
    },
  ];

  const onExportPayment = async () => {
    try {
      const payload = {
        id: id as string,
        start_date: exportRange?.startDate ?? defaultDate().formattedOneMonthAgo,
        end_date: exportRange?.endDate ?? defaultDate().formattedToday,
        group_by: groupBy,
      };
      const blob = await exportPayment(payload);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `[${payments?.data?.instructor_name}] Payment-${groupBy} - ${exportRange?.startDate} -  ${exportRange?.endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setOpenExport(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onGeneratePayroll = async (opts?: { allow_incomplete?: boolean; force_regenerate?: boolean }) => {
    try {
      const res = await generateReport({ id: id as string, year: reportYear, month: reportMonth, ...opts });
      const data = (res as unknown as { data: import("@/types/instructor.interface").IMonthlyReportData })?.data ?? (res as unknown as import("@/types/instructor.interface").IMonthlyReportData);
      if ((data as unknown as { download_url: string })?.download_url) setReportResult(data as unknown as import("@/types/instructor.interface").IMonthlyReportData);
      refetchReports();
      // langsung download via signed url (workaround BUG #9)
      if ((data as unknown as { download_url: string })?.download_url) window.open((data as unknown as { download_url: string }).download_url, "_blank");
      setPendingPeriod(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { code?: string; message?: string; details?: { can_generate_from?: string } } } } };
      const code = axiosErr?.response?.data?.error?.code;
      if (code === "PERIOD_NOT_ENDED") {
        setPendingPeriod({
          canGenerateFrom: axiosErr?.response?.data?.error?.details?.can_generate_from,
          message: axiosErr?.response?.data?.error?.message,
        });
        return;
      }
      console.log(err);
    }
  };

  const onPreviewPayroll = async () => {
    try {
      const blob = await previewMonthlyReport({ id: id as string, year: reportYear, month: reportMonth });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payment_report_${data?.data?.full_name?.replace(/\s+/g, "_")}_${MONTH_LIST.find((m) => Number(m.value) === reportMonth)?.label}_${reportYear}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log(e);
    }
  };

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: ISessionInstructorPayment) => (
      <Button variant={"outline"} size={"icon"} onClick={() => handleOpenModalDetail(row.session_id)}>
        <EyeIcon />
      </Button>
    ),
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="max-w-fit">
        <GeneralTabComponent selecetedTab={tabs} setTab={setTabs} tabs={instructorTabs} />
      </div>
      {tabs === "basic" && (
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center w-full justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold">Instructor Information</h3>
                <p className="text-sm text-gray-500">Review instructor information, reports, and class and payment history.</p>
              </div>
              <div className="flex flex-row items-center gap-2">
                <div>
                  {/* <Button variant={"outline"} >
                    <File /> Export
                  </Button> */}
                </div>
                <div>
                  <Button onClick={() => router.push(`${id}/edit`)}>
                    <PenIcon /> Edit
                  </Button>
                </div>
              </div>
            </div>
            <Divider className="my-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Basic Information */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold">Basic Information</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="grid col-span-3 text-gray-500">Instructor Name</div>
                  <div className="grid col-span-9">{data?.data?.full_name}</div>
                  <div className="grid col-span-3 text-gray-500">WhatsApp</div>
                  <div className="grid col-span-9">{data?.data?.phone}</div>
                  <div className="grid col-span-3 text-gray-500">Email</div>
                  <div className="grid col-span-9">{data?.data?.email}</div>
                  <div className="grid col-span-3 text-gray-500">Description</div>
                  <div className="grid col-span-9">{data?.data?.description ?? "-"}</div>
                  <div className="grid col-span-3 text-gray-500">Created At</div>
                  <div className="grid col-span-9">{formatDateHelper(data?.data?.created_at as string)}</div>
                  <div className="grid col-span-3 text-gray-500">Status</div>
                  <div className={`grid col-span-9 capitalize ${data?.data?.status === "active" ? `text-green-500` : `text-red-500`}`}>
                    {data?.data?.status}
                  </div>
                </div>
              </div>

              <Divider className="my-2" />

              {/* Payment Models */}
              <div className="flex flex-col gap-4 w-full">
                <h4 className="text-sm font-semibold">Payment Models</h4>
                {data?.data?.payment_rules && data.data.payment_rules.length > 0 ? (
                  <div className="space-y-3">
                    {data.data.payment_rules.map((rule, index) => {
                      const sessionKey = getSessionKey(rule);
                      const isExpanded = expandedCards[sessionKey];

                      return (
                        <div key={index} className="border-2 border-brand-100 rounded-lg overflow-hidden">
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-50 transition-colors"
                            onClick={() => toggleCard(sessionKey)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{SESSION_TYPE_LABELS[sessionKey]}</span>
                              <Badge variant="outline" className="text-xs">
                                {PAYMENT_MODEL_LABELS[rule.payment_model]}
                              </Badge>
                            </div>
                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                          </div>

                          {isExpanded && <div className="px-4 pb-4 pt-2">{renderModelParams(rule.payment_model, rule.model_params)}</div>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No payment models configured</div>
                )}
              </div>

              <Divider className="my-2" />

              {/* Payment Information */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold">Payment Information</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="grid col-span-3 text-gray-500">Bank Name</div>
                  <div className="grid col-span-9">{data?.data?.bank_name}</div>
                  <div className="grid col-span-3 text-gray-500">Account Number</div>
                  <div className="grid col-span-9">{data?.data?.bank_account_number}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {tabs === "payment" && (
        <Card>
          <CardHeader className="flex flex-row items-center w-full justify-between">
            <div className="flex flex-col w-full">
              <h3 className="text-2xl font-semibold">Class & Payment</h3>
              <p className="text-sm text-gray-500">Track completed classes and related payment details.</p>
            </div>
            <div className="flex flex-row items-center gap-2 w-full justify-end">
              <div className="">
                {/* <Select
                  onValueChange={(e) => {
                    handleDateRangeChangeDual("year", e);
                  }}
                  value={selectedRange.year}
                >
                  <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                    <SelectValue placeholder="Select Year" className="!text-gray-400" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {YEAR_LIST.map((item) => (
                        <SelectItem value={String(item)} key={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select> */}

                <DateRangePicker
                  mode="range"
                  onDateRangeChange={handleDateRangeChangeDual}
                  startDate={selectedRange?.startDate ?? undefined}
                  endDate={selectedRange?.endDate ?? undefined}
                  allowFutureDates
                  allowPastDates
                />
              </div>
              {/* <div className="">
                <Select
                  onValueChange={(e) => {
                    handleDateRangeChangeDual("month", e);
                  }}
                  value={selectedRange.month as string}
                >
                  <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                    <SelectValue placeholder="Select Month" className="!text-gray-400" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {MONTH_LIST.map((item) => (
                        <SelectItem value={String(item.value)} key={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div> */}
              <div className="">
                <Button variant={"outline"}>
                  <ListFilter /> Filter
                </Button>
              </div>
              <div className="">
                <Button variant={"outline"} onClick={handleOpenExport} disabled={isPending}>
                  <File /> Export
                </Button>
              </div>
              <div className="">
                <Button>
                  <Receipt /> Process Payment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <CustomTable
                headers={headers}
                data={payments?.data?.sessions ?? []}
                isLoading={isFetching || loadingPayments}
                actionOptions={actionOptions}
              />
              <CustomPagination
                onPageChange={(e) => {
                  setPage(e);
                }}
                currentPage={page}
                showTotal
                hasPrevPage={payments?.data?.pagination.has_prev}
                hasNextPage={payments?.data?.pagination?.has_next}
                totalItems={payments?.data?.pagination?.total_items as number}
                totalPages={payments?.data?.pagination?.total_pages as number}
                limit={10}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {tabs === "report" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold">Payroll Report</h3>
                <p className="text-sm text-gray-500">Payroll period {payrollPeriod.display} (24th previous month → 23rd current month) • 7-column CSV</p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-3 items-end flex-wrap">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Month</p>
                    <Select value={String(reportMonth)} onValueChange={(v) => setReportMonth(Number(v))}>
                      <SelectTrigger className="w-[160px]"><SelectValue placeholder="Select month" /></SelectTrigger>
                      <SelectContent><SelectGroup>{MONTH_LIST.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Year</p>
                    <Select value={String(reportYear)} onValueChange={(v) => setReportYear(Number(v))}>
                      <SelectTrigger className="w-[120px]"><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent><SelectGroup>{YEAR_LIST.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[200px]">
                    <p className="text-sm font-medium">Payroll Period</p>
                    <Badge variant="outline" className="h-9 px-3 flex items-center gap-1 bg-muted/30 font-normal"><span className="truncate">{payrollPeriod.display}</span></Badge>
                  </div>
                  <div className="flex gap-2 ml-auto flex-wrap">
                    <Button variant="outline" onClick={onPreviewPayroll} className="whitespace-nowrap">Preview CSV</Button>
                    <Button onClick={() => onGeneratePayroll()} disabled={isGenerating} className="whitespace-nowrap">{isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <File className="h-4 w-4 mr-2" />} {isGenerating ? "Generating..." : "Generate Report"}</Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Report is calculated 24th previous month → 23rd selected month. Example: {MONTH_LIST.find((m) => Number(m.value) === reportMonth)?.label} {reportYear} = {payrollPeriod.display}. CSV has 7 columns: No, Session, Date, Customer, Revenue (IDR), Compensation Basis (IDR), Teacher Payment (IDR).</p>
              </div>

              {reportResult ? (
                <div className="rounded-lg border p-4 flex flex-col gap-3 bg-gradient-to-br from-brand-50/60 to-white shadow-sm animate-in fade-in">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className={reportResult.is_cached ? "border-green-200 bg-green-50 text-green-700" : "border-blue-200 bg-blue-50 text-blue-700"}>{reportResult.is_cached ? "Ready to Download • Saved" : "Newly Created"}</Badge>
                    {reportResult.is_incomplete && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Provisional — final after 24 {MONTH_LIST.find((m) => Number(m.value) === reportMonth)?.label}</Badge>}
                    <span className="text-sm text-muted-foreground">Created {formatDateHelper(reportResult.generated_at, "dd MMM yyyy HH:mm")}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-md bg-muted/40 p-2.5"><div className="text-xs text-muted-foreground">Sessions</div><div className="font-semibold text-base">{reportResult.total_sessions} sessions</div></div>
                    <div className="rounded-md bg-muted/40 p-2.5"><div className="text-xs text-muted-foreground">Bookings</div><div className="font-semibold text-base">{reportResult.total_bookings}</div></div>
                    <div className="rounded-md bg-muted/40 p-2.5"><div className="text-xs text-muted-foreground">Total Revenue</div><div className="font-semibold text-base">{formatCurrency(reportResult.total_revenue)}</div></div>
                    <div className="rounded-md bg-brand-50 p-2.5 border border-brand-100"><div className="text-xs text-brand-700">Total Teacher Pay</div><div className="font-semibold text-base text-brand-900">{formatCurrency(reportResult.total_payment)}</div></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><File className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{reportResult.file_name} • {reportResult.period}</span></div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => window.open(reportResult.download_url, "_blank")}><File className="h-4 w-4 mr-2" />Download Report</Button>
                    <Button variant="outline" onClick={() => onGeneratePayroll({ force_regenerate: true })} disabled={isGenerating}>Regenerate</Button>
                    <Button variant="ghost" onClick={() => setReportResult(null)}>Dismiss</Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 bg-muted/20 text-sm text-muted-foreground leading-relaxed">
                  Select month & year above, then click <span className="font-medium text-foreground">Generate Report</span> to create the payroll report. Use <span className="font-medium text-foreground">Preview CSV</span> for a quick view without saving to history. Generated reports will appear in the History table below.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Report History</h4>
                  <p className="text-sm text-muted-foreground">All saved reports for this instructor & period • Click Download to re-download (link valid for 1 hour)</p>
                </div>
                <Badge variant="outline" className="whitespace-nowrap">{(teacherReports as unknown as { pagination?: { total_items: number } })?.pagination?.total_items ?? 0} reports</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CustomTable
                headers={[
                  { id: "period", text: "Period", value: (r: import("@/types/instructor.interface").ITeacherReportItem) => <span className="whitespace-nowrap">{r.period ?? `${r.period_start} → ${r.period_end}`}</span> },
                  { id: "sessions", text: "Sessions", value: "total_sessions" },
                  { id: "bookings", text: "Bookings", value: "total_bookings" },
                  { id: "payment", text: "Total Pay", value: (r: import("@/types/instructor.interface").ITeacherReportItem) => formatCurrency(r.total_payment) },
                  { id: "file", text: "File", value: (r: import("@/types/instructor.interface").ITeacherReportItem) => <span className="text-xs truncate max-w-[200px] inline-block" title={r.file_name}>{r.file_name}</span> },
                  { id: "action", text: "Action", value: (r: import("@/types/instructor.interface").ITeacherReportItem) => <Button variant="outline" size="sm" onClick={() => window.open(r.download_url, "_blank")}><File className="h-3 w-3 mr-1" />Download</Button> },
                ]}
                data={(teacherReports?.data as unknown as import("@/types/instructor.interface").ITeacherReportItem[]) ?? []}
                isLoading={fetchingReports}
              />
              <CustomPagination currentPage={reportPage} onPageChange={setReportPage} hasPrevPage={(teacherReports as unknown as { pagination?: { has_prev: boolean } })?.pagination?.has_prev} hasNextPage={(teacherReports as unknown as { pagination?: { has_next: boolean } })?.pagination?.has_next} totalItems={(teacherReports as unknown as { pagination?: { total_items: number } })?.pagination?.total_items as number} totalPages={(teacherReports as unknown as { pagination?: { total_pages: number } })?.pagination?.total_pages as number} limit={10} />
            </CardContent>
          </Card>
        </div>
      )}
      {openExport && (
        <BaseDialogComponent
          isOpen={openExport}
          title="Export Payment"
          btnConfirm="Export"
          onClose={() => setOpenExport(false)}
          onConfirm={onExportPayment}
          isDisabled={!!isPending}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Group by</p>
              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as "student" | "session")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="session">By Session</SelectItem>
                    <SelectItem value="student">By Student</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose how rows are grouped in the CSV. For official teacher payroll, use Payroll Report → Generate Report.</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Date range</p>
              <DateRangePicker
                mode="range"
                startDate={exportRange.startDate ?? undefined}
                endDate={exportRange.endDate ?? undefined}
                onDateRangeChange={handleExportRangeChange}
                allowPastDates
                allowFutureDates
              />
            </div>
          </div>
        </BaseDialogComponent>
      )}
      {pendingPeriod && (
        <BaseDialogConfirmation
          open={!!pendingPeriod}
          title="Period not yet complete"
          subtitle={`${pendingPeriod.message ?? `Report for ${MONTH_LIST.find((m) => Number(m.value) === reportMonth)?.label} ${reportYear} can only be generated from 24 ${MONTH_LIST.find((m) => Number(m.value) === reportMonth)?.label}`} ${pendingPeriod.canGenerateFrom ? `(available from ${formatDateHelper(pendingPeriod.canGenerateFrom, "dd MMM yyyy")})` : ""} — Generate a provisional report now? It will be marked Provisional and finalized automatically after the 24th.`}
          confirmText="Yes, Generate Provisional"
          onConfirm={() => { setPendingPeriod(null); onGeneratePayroll({ allow_incomplete: true }); }}
          onCancel={() => setPendingPeriod(null)}
          image="warning-1"
        />
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
