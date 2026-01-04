"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { CustomTable } from "@/components/general/custom-table";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { useGetInstructorDetail } from "@/hooks/api/queries/admin/instructor";
import { useGetInstructorPaymentDetails } from "@/hooks/api/queries/admin/instructor/use-get-instructor-payment-details";
import { defaultDate, formatDateHelper } from "@/lib/helper";
import { File, ListFilter, Loader2, PenIcon, Receipt } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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

export const InstructorDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { data, isLoading } = useGetInstructorDetail(id as string);
  const [page, setPage] = useState(1);
  const [tabs, setTabs] = useState("basic");
  const [selectedRange, setSelectedRange] = useState({
    from: defaultDate().formattedOneMonthAgo,
    to: defaultDate().formattedToday,
  });

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };

  const { data: payments, isLoading: loadingPayments } = useGetInstructorPaymentDetails(
    {
      id: id as string,
      startDate: selectedRange.from,
      endDate: selectedRange.to,
      page,
    },
    tabs,
  );

  const headers = [
    {
      id: "sessions",
      text: "Sessions",
      value: "Session Name",
    },
    {
      id: "class",
      text: "Class",
      value: "class",
    },
    {
      id: "date_time",
      text: "Date & Time",
      value: "date_time",
    },
    {
      id: "payment_models",
      text: "Payment Models",
      value: "payment_models",
    },
    {
      id: "payment_amount",
      text: "Payment Amount",
      value: "payment_amount",
    },
  ];

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
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold">Basic Information</h4>
                <div className="grid grid-cols-12 gap-4">
                  <div className="grid col-span-3 text-gray-500">Instructor Name</div>
                  <div className="grid col-span-9">{data?.data?.full_name}</div>
                  <div className="grid col-span-3 text-gray-500">WhatsApp</div>
                  <div className="grid col-span-9">{data?.data?.phone}</div>
                  <div className="grid col-span-3 text-gray-500">Email</div>
                  <div className="grid col-span-9">{data?.data?.email}</div>
                  <div className="grid col-span-3 text-gray-500">Skill Set</div>
                  <div className="grid col-span-9">{data?.data?.description}</div>
                  <div className="grid col-span-3 text-gray-500">Created At</div>
                  <div className="grid col-span-9">{formatDateHelper(data?.data?.created_at as string)}</div>
                  <div className="grid col-span-3 text-gray-500">Status</div>
                  <div className={`grid col-span-9 capitalize ${data?.data?.status ? `text-green-500` : `text-red-500`}`}>{data?.data?.status}</div>
                </div>
              </div>
              <Divider className="my-2" />

              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold">Payment Models</h4>
                {/* <div className="grid grid-cols-12 gap-4">
              <div className="grid col-span-3 text-gray-500">Start Date</div>
              <div className="grid col-span-9">{formatDateHelper(data?.data?.start_date as string, "dd MMM yyyy")}</div>
              <div className="grid col-span-3 text-gray-500">Time</div>
              <div className="grid col-span-9">
                {data?.data?.time_start} - {data?.data?.time_end}
              </div>
              <div className="grid col-span-3 text-gray-500">Location Type</div>
              <div className="grid col-span-9">{data?.data?.place}</div>
              <div className="grid col-span-3 text-gray-500">Location Details</div>
              <div className="grid col-span-9">{data?.data?.location}</div>
              <div className="grid col-span-3 text-gray-500">Location Maps Url</div>
              <div className="grid col-span-9">
                <a href={data?.data.location_maps_url} target="_blank" className="text-blue-500 underline">
                  {data?.data?.location}
                </a>
              </div>
            </div> */}
              </div>
              <Divider className="my-2" />

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
              <h3 className="text-2xl font-semibold">Class & Paymnet</h3>
              <p className="text-sm text-gray-500">Track completed classes and related payment details.</p>
            </div>
            <div className="flex flex-row items-center gap-2 w-full justify-end">
              <div className="">
                <DateRangePicker
                  mode="range"
                  onDateRangeChange={handleDateRangeChangeDual}
                  startDate={selectedRange.from}
                  endDate={selectedRange.to}
                  allowFutureDates
                  allowPastDates={false}
                />
              </div>
              <div className="">
                <Button variant={"outline"}>
                  <ListFilter /> Filter
                </Button>
              </div>
              <div className="">
                <Button variant={"outline"}>
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
              <CustomTable headers={headers} data={payments?.data ?? []} isLoading={loadingPayments} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
