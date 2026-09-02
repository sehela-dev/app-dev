"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { BackButtonComponent } from "@/components/general/back-button";
import { CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import {
  useGetCustomerActivity,
  useGetCustomerDetail,
  useGetCustomerTrx,
  useGetHistoricalPackagePurchases,
} from "@/hooks/api/queries/admin/customers";
import { useAdminPermission } from "@/hooks/use-role-access";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { ICustomerActvity, ICustomerTrx, IHistoricalPackagePurchase } from "@/types/customers.interface";
import { File, Loader2, PenIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTH_LIST, YEAR_LIST } from "@/constants/sample-data";
import { exportCustomerActivity } from "@/api-req/customer";
import { toast } from "sonner";
import { BaseDialogComponent } from "@/components/general/base-dialog-component";

const instructorTabs = [
  {
    value: "basic",
    name: "Information",
  },
  {
    value: "credit-history",
    name: "Credit History",
  },
  {
    value: "activity",
    name: "Activity",
  },
  {
    value: "trx",
    name: "Transaction",
  },
];

export const CustomerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { isManager } = useAdminPermission();
  const [tabs, setTabs] = useState("basic");
  const [activityPage, setActivityPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [creditHistoryPage, setCreditHistoryPage] = useState(1);
  const [activitySort, setActivitySort] = useState<{ key?: string; direction?: "asc" | "desc" }>();
  const [selectedRange, setSelectedRange] = useState<{ startDate?: string | null; endDate?: string | null }>({
    startDate: null,
    endDate: null,
  });
  const [openExportStudent, setOpenExportStudent] = useState(false);
  const [exportYear, setExportYear] = useState<string>("");
  const [exportMonth, setExportMonth] = useState<string>("");
  const [exportBookingStatus, setExportBookingStatus] = useState<string>("all");
  const [exportAttendanceStatus, setExportAttendanceStatus] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  const handleDateRangeChangeDual = (startDate?: string, endDate?: string) => {
    setSelectedRange({ startDate: startDate ?? null, endDate: endDate ?? null });
    setActivityPage(1);
  };
  const { data, isLoading } = useGetCustomerDetail(id as string);
  const { data: activity, isLoading: loadingActivity } = useGetCustomerActivity(
    {
      id: id as string,
      startDate: selectedRange.startDate as string,
      endDate: selectedRange.endDate as string,
      page: activityPage,
      limit: 10,
      sort_by: activitySort?.key ?? "booked_at",
      order: activitySort?.direction ?? "desc",
    },
    tabs === "activity",
  );

  const handleExportActivity = async () => {
    try {
      setExporting(true);
      const blob = await exportCustomerActivity({
        id: id as string,
        ...(exportYear ? { year: Number(exportYear) } : null),
        ...(exportMonth ? { month: Number(exportMonth) } : null),
        ...(!exportYear && !exportMonth ? { startDate: selectedRange.startDate as string } : null),
        ...(!exportYear && !exportMonth ? { endDate: selectedRange.endDate as string } : null),
        ...(exportBookingStatus !== "all" ? { booking_status: exportBookingStatus } : null),
        ...(exportAttendanceStatus !== "all" ? { attendance_status: exportAttendanceStatus } : null),
        sort_by: activitySort?.key ?? "session_start",
        order: activitySort?.direction ?? "desc",
      } as unknown as import("@/types/customers.interface").ICustomerActivityParams);
      const blobTyped = blob as Blob;
      const name = data?.data?.profile?.full_name?.replace(/\s+/g, "_") ?? "Student";
      const period = exportYear && exportMonth ? `${exportYear}-${String(exportMonth).padStart(2, "0")}` : exportYear ? `${exportYear}` : selectedRange.startDate ? `${selectedRange.startDate}_${selectedRange.endDate}` : "all";
      const url = window.URL.createObjectURL(blobTyped);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sessions_${name}_${period}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export started", { description: "CSV downloaded", position: "top-center" });
      setOpenExportStudent(false);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { error?: { message?: string } } } };
      if (err?.response?.status === 404) toast.error("Student not found", { position: "top-center" });
      else toast.error("Export failed", { description: err?.response?.data?.error?.message ?? "Please try again", position: "top-center" });
    } finally {
      setExporting(false);
    }
  };
  const { data: trx, isLoading: loadingTrx } = useGetCustomerTrx({ id: id as string, page: transactionPage, limit: 10 }, tabs === "trx");
  const {
    data: historicalPurchases,
    isLoading: loadingHistoricalPurchases,
    isError: historicalPurchasesError,
    error: historicalPurchasesErrorDetail,
    refetch: refetchHistoricalPurchases,
  } = useGetHistoricalPackagePurchases(
    {
      userId: id as string,
      page: creditHistoryPage,
      pageSize: 20,
    },
    tabs === "credit-history",
  );

  const headers = [
    {
      id: "start_datetime",
      text: "Session Date & Time",
      sortable: true,
      sortKey: "session_start",
      value: (row: ICustomerActvity) => formatDateHelper(row.start_datetime, "dd/MM/yyyy HH:mm"),
    },

    {
      id: "session_name",
      text: "Session",
      value: (row: ICustomerActvity) => (
        <a href={`/admin/session/${row.session_id}`} className="text-brand-500 font-semibold underline">
          <p className="capitalize max-w-[70%] flex-wrap text-wrap">{row?.session_name}</p>
        </a>
      ),
    },
    {
      id: "session_location",
      text: "Locations",
      value: "session_location",
    },
    {
      id: "class_name",
      text: "Class",
      value: "class_name",
    },
    {
      id: "instructor_name",
      text: "Instructor",
      value: "instructor_name",
    },
    {
      id: "attendance",
      text: "Attendance",
      value: (row: ICustomerActvity) => (
        <p className="capitalize italic text-gray-500 font-bold">{row?.attendance_status ? row.attendance_status : "No Confirmation"}</p>
      ),
    },
    {
      id: "payment_method",
      text: "Payment",
      value: (row: ICustomerActvity) => (
        <p className="capitalize">
          {row?.payment_method} - {row.booking_source ?? ""}
        </p>
      ),
    },
    {
      id: "booking_status",
      text: "Booking Status",
      value: (row: ICustomerActvity) => (
        <Badge variant={row?.booking_status === "canceled" ? "destructive" : "default"} className="capitalize">
          {row.booking_status}
        </Badge>
      ),
    },
    {
      id: "created_at",
      text: "Created at",
      sortable: true,
      sortKey: "booked_at",
      value: (row: ICustomerActvity) => formatDateHelper(row.booked_at, "dd/MM/yyyy HH:mm"),
    },
  ];

  const headersTrx = [
    {
      id: "order_id",
      text: "Order ID",
      value: (row: ICustomerTrx) => (
        <a href={`/admin/orders/${row.id}`} target="_blank" className="text-brand-500 font-semibold underline">
          <p className="capitalize max-w-[70%] flex-wrap text-wrap">{row?.order_id}</p>
        </a>
      ),
    },
    {
      id: "date_purchased",
      text: "Date",
      value: (row: ICustomerTrx) => formatDateHelper(row.date_purchased, "dd/MM/yyyy H:mm"),
    },
    {
      id: "payment_method",
      text: "Payment Method",
      value: (row: ICustomerTrx) => <p className="capitalize">{row.payment_method}</p>,
    },
    {
      id: "type",
      text: "Type",
      value: (row: ICustomerTrx) => <p className="capitalize">{row.type}</p>,
    },
    {
      id: "price_idr",
      text: "Price",
      value: (row: ICustomerTrx) => formatCurrency(row.price_idr),
    },
    {
      id: "status",
      text: "Status",
      value: (row: ICustomerTrx) => (
        <Badge className="capitalize" variant={row.status === "paid" ? "default" : "destructive"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  const historicalPurchaseHeaders = [
    {
      id: "package",
      text: "Package",
      value: (row: IHistoricalPackagePurchase) => (
        <div className="flex flex-col gap-1">
          <Button
            variant="link"
            className="h-auto justify-start p-0 text-left text-brand-500"
            onClick={() => (isManager ? router.push(`/admin/member/${id}/credit-packages/${row.id}`) : () => { })}
          >
            {row.credit_package?.name ?? "-"}
          </Button>
          <span className="text-xs text-gray-500">
            Per credit: {row.per_credit_value_idr === null ? "-" : formatCurrency(row.per_credit_value_idr)}
          </span>
        </div>
      ),
    },
    {
      id: "purchased_at",
      text: "Purchased Date",
      value: (row: IHistoricalPackagePurchase) => (row.purchased_at ? formatDateHelper(row.purchased_at, "dd/MM/yyyy H:mm") : "-"),
    },
    {
      id: "package_type",
      text: "Package Type",
      value: (row: IHistoricalPackagePurchase) => <p className="capitalize">{row.credit_package?.package_type ?? "-"}</p>,
    },
    {
      id: "status",
      text: "Status",
      value: (row: IHistoricalPackagePurchase) => (
        <Badge className="capitalize" variant={row.status === "paid" ? "default" : "destructive"}>
          {row.status ?? "-"}
        </Badge>
      ),
    },
    {
      id: "credits_remaining",
      text: "Credits Remaining",
      value: (row: IHistoricalPackagePurchase) => String(row.credits_remaining),
    },
    {
      id: "credits_used",
      text: "Credits Used",
      value: (row: IHistoricalPackagePurchase) => String(row.credits_used),
    },
    {
      id: "expires_at",
      text: "Expired At",
      value: (row: IHistoricalPackagePurchase) => (row.expires_at ? formatDateHelper(row.expires_at, "dd/MM/yyyy H:mm") : "-"),
    },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px]">
          <GeneralTabComponent selecetedTab={tabs} setTab={setTabs} tabs={instructorTabs} />
        </div>
      </div>
      {tabs === "basic" && (
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center w-full justify-between">
              <BackButtonComponent>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold">Member Information</h3>
                  <p className="text-sm text-gray-500">Review and manage essential member data to ensure service accuracy.</p>
                </div>
              </BackButtonComponent>

              <div className="flex flex-row items-center gap-2">
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
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold">Basic Information</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="grid col-span-3 text-gray-500">Name</div>
                  <div className="grid col-span-9">{data?.data?.profile?.full_name}</div>
                  <div className="grid col-span-3 text-gray-500">WhatsApp</div>
                  <div className="grid col-span-9">{data?.data?.profile?.phone}</div>
                  <div className="grid col-span-3 text-gray-500">Email</div>
                  <div className="grid col-span-9">{data?.data?.profile?.email}</div>
                  <div className="grid col-span-3 text-gray-500">Created At</div>
                  <div className="grid col-span-9">{formatDateHelper(data?.data?.profile?.created_at as string)}</div>
                  <div className="grid col-span-3 text-gray-500">Status</div>
                  <div className={`grid col-span-9 capitalize ${data?.data?.profile?.is_active ? `text-green-500` : `text-red-500`}`}>
                    {data?.data?.profile.is_active ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>

              <Divider className="my-2" />

              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold">Credits</h4>
                <div className="grid gap-4 grid-cols-4">
                  {(data?.data?.wallet?.active_packages.length as number) > 0 ? (
                    data?.data?.wallet?.active_packages?.map((item) => (
                      <Card className="border-brand-500 shadow-md p-4 gap-1" key={item.package_purchase_id}>
                        <CardHeader className="p-0 font-medium text-sm">{item.package_name}</CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-12 gap-1">
                            <div className="grid col-span-4 text-gray-500 text-sm">Amount</div>
                            <div className="grid col-span-8 text-brand-999 text-sm">{item.credits_remaining}</div>
                            <div className="grid col-span-4 text-gray-500 text-sm">Expired</div>
                            <div className="grid col-span-8 text-brand-999 text-sm">
                              {item.expires_at ? formatDateHelper(item.expires_at, "dd MMM yyyy") : "-"}
                            </div>
                          </div>
                        </CardContent>
                        {isManager && (
                          <CardFooter className="p-0 pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/member/${id}/credit-packages/${item.package_purchase_id}`)}
                            >
                              Manage
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))
                  ) : (
                    <div className="flex w-full items-center justify-center col-span-12">
                      <p className="capitalize  text-sm italic text-gray-500 font-bold">No Credit Active</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {tabs === "activity" && (
        <div className="flex flex-col gap-4 w-full">
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center w-full justify-between">
                <BackButtonComponent>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl text-brand-999 font-medium">Member Sessions History</h3>
                    <p className="text-sm text-gray-500 max-w-[80%]">Monitor member activity, attendance, and payment status</p>
                  </div>
                </BackButtonComponent>
                <div className="flex flex-row items-center gap-2">
                  <div>
                    <DateRangePicker
                      mode="range"
                      onDateRangeChange={handleDateRangeChangeDual}
                      startDate={selectedRange?.startDate ?? undefined}
                      endDate={selectedRange?.endDate ?? undefined}
                      allowFutureDates
                      allowPastDates
                    />
                  </div>
                  <div>
                    <Button variant="outline" onClick={() => setOpenExportStudent(true)}><File className="h-4 w-4 mr-2" />Export CSV</Button>

                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="">
              <CustomTable headers={headers} data={activity?.data ?? []} isLoading={loadingActivity} setSort={setActivitySort} />
            </CardContent>
            <CardFooter>
              <CustomPagination
                onPageChange={(e) => {
                  setActivityPage(e);
                }}
                currentPage={activityPage}
                showTotal
                hasPrevPage={activity?.pagination?.has_prev}
                hasNextPage={activity?.pagination?.has_next}
                totalItems={activity?.pagination?.total_items as number}
                totalPages={activity?.pagination?.total_pages as number}
                limit={10}
              />
            </CardFooter>
          </Card>
          {openExportStudent && (
            <BaseDialogComponent
              isOpen={openExportStudent}
              title="Export Sessions"
              btnConfirm="Export CSV"
              onClose={() => setOpenExportStudent(false)}
              onConfirm={handleExportActivity}
              isDisabled={exporting}
            >
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Table shows date-range filtered data. Use these filters only for the CSV export — <span className="font-medium">year/month overrides date range</span>.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Year</p>
                    <Select value={exportYear} onValueChange={(v) => setExportYear(v === "all" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="All Years" /></SelectTrigger>
                      <SelectContent><SelectGroup><SelectItem value="all">All Years</SelectItem>{YEAR_LIST.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Month</p>
                    <Select value={exportMonth} onValueChange={(v) => setExportMonth(v === "all" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="All Months" /></SelectTrigger>
                      <SelectContent><SelectGroup><SelectItem value="all">All Months</SelectItem>{MONTH_LIST.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Booking Status</p>
                    <Select value={exportBookingStatus} onValueChange={setExportBookingStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup><SelectItem value="all">All Booking</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="canceled">Canceled</SelectItem><SelectItem value="confirmed,canceled">Confirmed + Canceled</SelectItem></SelectGroup></SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Attendance</p>
                    <Select value={exportAttendanceStatus} onValueChange={setExportAttendanceStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup><SelectItem value="all">All Attendance</SelectItem><SelectItem value="attended">Attended</SelectItem><SelectItem value="no_show">No Show</SelectItem><SelectItem value="attended,no_show">Attended + No Show</SelectItem></SelectGroup></SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">If year/month is set, date range is ignored. CSV includes all matching rows (no pagination) with current sort. Filename: <span className="font-mono">sessions_{"{name}"}_{"{year-month|dates}"}.csv</span></p>
              </div>
            </BaseDialogComponent>
          )}
        </div>
      )}
      {tabs === "trx" && (
        <div className="flex flex-col gap-4 w-full">
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center w-full justify-between">
                <BackButtonComponent>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl text-brand-999 font-medium">Members Transaction History</h3>
                    <p className="text-sm text-gray-500 max-w-[80%]">Monitor member transaction status</p>
                  </div>
                </BackButtonComponent>
                <div className="flex flex-row items-center gap-4"></div>
              </div>
            </CardHeader>
            <CardContent className="">
              <CustomTable headers={headersTrx} data={trx?.data ?? []} isLoading={loadingTrx} />
            </CardContent>
            <CardFooter>
              <CustomPagination
                onPageChange={(e) => {
                  setTransactionPage(e);
                }}
                currentPage={transactionPage}
                showTotal
                hasPrevPage={trx?.pagination?.has_prev}
                hasNextPage={trx?.pagination?.has_next}
                totalItems={trx?.pagination?.total_items as number}
                totalPages={trx?.pagination?.total_pages as number}
                limit={10}
              />
            </CardFooter>
          </Card>
        </div>
      )}
      {tabs === "credit-history" && (
        <div className="flex flex-col gap-4 w-full">
          <Card>
            <CardHeader>
              <BackButtonComponent>
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl text-brand-999 font-medium">Credit History</h3>
                  <p className="text-sm text-gray-500 max-w-[80%]">Historical credit package purchases for this member.</p>
                </div>
              </BackButtonComponent>
            </CardHeader>
            <CardContent>
              {loadingHistoricalPurchases ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading credit history...
                </div>
              ) : historicalPurchasesError ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-sm text-gray-500">
                    {historicalPurchasesErrorDetail instanceof Error ? historicalPurchasesErrorDetail.message : "Unable to load credit history."}
                  </p>
                  <Button variant="outline" onClick={() => refetchHistoricalPurchases()}>
                    Retry
                  </Button>
                </div>
              ) : historicalPurchases?.data.length ? (
                <CustomTable headers={historicalPurchaseHeaders} data={historicalPurchases.data} />
              ) : (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-sm text-gray-500">
                    {creditHistoryPage === 1
                      ? "No historical credit purchases for this member."
                      : "There are no historical credit purchases on this page."}
                  </p>
                  {creditHistoryPage > 1 && (
                    <Button variant="outline" onClick={() => setCreditHistoryPage((currentPage) => currentPage - 1)}>
                      Back to previous page
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            {!historicalPurchasesError && !loadingHistoricalPurchases && (
              <CardFooter>
                <CustomPagination
                  onPageChange={setCreditHistoryPage}
                  currentPage={creditHistoryPage}
                  showTotal
                  hasPrevPage={historicalPurchases?.pagination?.has_prev}
                  hasNextPage={historicalPurchases?.pagination?.has_next}
                  totalItems={historicalPurchases?.pagination?.total_items ?? 0}
                  totalPages={historicalPurchases?.pagination?.total_pages}
                  limit={20}
                />
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
