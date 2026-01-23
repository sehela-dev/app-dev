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
import { File, ListFilter, Loader2, PenIcon, Receipt, ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { IModelParams, IPaymentRuleResponse, ISessionInstructorPayment } from "@/types/instructor.interface";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTH_LIST, YEAR_LIST } from "@/constants/sample-data";
import { CustomPagination } from "@/components/general/pagination-component";
import { useExportInstructorPayment } from "@/hooks/api/mutations/admin";
import { BaseDialogComponent } from "@/components/general/base-dialog-component";

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
    name: "Report",
  },
];

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
  const [selectedRange, setSelectedRange] = useState({
    startDate: defaultDate().formattedOneMonthAgo,
    endDate: defaultDate().formattedToday,
  });

  const [openExport, setOpenExport] = useState(false);
  const [selectPeriodExport, setSelectPeriodExport] = useState({
    month: formatDateHelper(defaultDate().formattedToday, "M") as string,
    year: formatDateHelper(defaultDate().formattedToday, "yyyy") as string,
  });

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };
  const handleSelectPeriode = (type: "month" | "year", data: string) => {
    setSelectPeriodExport((prev) => ({ ...prev, [type]: data }));
  };
  const { mutateAsync: exportPayment, isPending } = useExportInstructorPayment();
  const { data: payments, isLoading: loadingPayments } = useGetInstructorPaymentDetails(
    {
      id: id as string,
      startDate: selectedRange.startDate,
      endDate: selectedRange.endDate,
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
        year: selectPeriodExport.year,
        month: selectPeriodExport.month,
      };
      const res = await exportPayment(payload);
      if (res) {
        console.log(res);
        setOpenExport(false);
        window.open(res.data.download_url, "_blank");
      }
    } catch (error) {
      console.log(error);
    }
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
                  <Button variant={"outline"}>
                    <File /> Export
                  </Button>
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
                  startDate={selectedRange.startDate}
                  endDate={selectedRange.endDate}
                  allowFutureDates
                  allowPastDates={false}
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
                <Button variant={"outline"} onClick={() => setOpenExport(true)}>
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
              <CustomTable headers={headers} data={payments?.data?.sessions ?? []} isLoading={loadingPayments} />
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
      {openExport && (
        <BaseDialogComponent
          isOpen={openExport}
          title="Export Data"
          onClose={() => {
            setOpenExport(false);
          }}
          onConfirm={onExportPayment}
          isDisabled={!!isPending}
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <p>Year:</p>
              <Select
                onValueChange={(e) => {
                  handleSelectPeriode("year", e);
                }}
                value={selectPeriodExport.year}
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
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p>Month:</p>
              <Select
                onValueChange={(e) => {
                  handleSelectPeriode("month", e);
                }}
                value={selectPeriodExport.month as string}
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
            </div>
          </div>
        </BaseDialogComponent>
      )}
    </div>
  );
};
