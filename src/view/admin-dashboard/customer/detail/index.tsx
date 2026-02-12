"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { MONTH_LIST, YEAR_LIST } from "@/constants/sample-data";
import { useGetCustomerActivity, useGetCustomerDetail } from "@/hooks/api/queries/admin/customers";
import { defaultDate, formatDateHelper } from "@/lib/helper";
import { ICustomerActvity } from "@/types/customers.interface";
import { Loader2, PenIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const instructorTabs = [
  {
    value: "basic",
    name: "Information",
  },
  {
    value: "activity",
    name: "Activity",
  },
];

export const CustomerDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [page, setPage] = useState(1);
  const [selectPeriod, setSelectPeriod] = useState({
    month: formatDateHelper(defaultDate().formattedToday, "M") as string,
    year: formatDateHelper(defaultDate().formattedToday, "yyyy") as string,
  });
  const { data, isLoading } = useGetCustomerDetail(id as string);
  const {
    data: activity,
    isLoading: loadingActivity,
    refetch,
  } = useGetCustomerActivity({
    id: id as string,
    startDate: selectPeriod.year as string,
    endDate: selectPeriod.month as string,
    page,
    limit: 10,
  });

  const [tabs, setTabs] = useState("basic");

  const handleSelectPeriode = (type: "month" | "year", data: string) => {
    setSelectPeriod((prev) => ({ ...prev, [type]: data }));
  };

  const headers = [
    {
      id: "start_datetime",
      text: "Session Date & Time",
      value: (row: ICustomerActvity) => formatDateHelper(row.start_datetime, "dd/MM/yyyy H:mm"),
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
      id: "booking_status",
      text: "Status",
      value: (row: ICustomerActvity) => <p className="capitalize">{row?.booking_status}</p>,
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
      text: "Paymnet",
      value: (row: ICustomerActvity) => <p className="capitalize">{row?.payment_method}</p>,
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
      <div className="max-w-[25%]">
        <GeneralTabComponent selecetedTab={tabs} setTab={setTabs} tabs={instructorTabs} />
      </div>
      {tabs === "basic" && (
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center w-full justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold">Member Information</h3>
                <p className="text-sm text-gray-500">Review and manage essential member data to ensure service accuracy.</p>
              </div>
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
                  <div className="grid col-span-3 text-gray-500">Instructor Name</div>
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
                  {data?.data?.wallet?.active_packages?.map((item) => (
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
                    </Card>
                  ))}
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
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl text-brand-999 font-medium">Members Sessions History</h3>
                  <p className="text-sm text-gray-500 max-w-[80%]">Monitor member activity, attendance, and payment status</p>
                </div>
                <div className="flex flex-row items-center gap-4">
                  <div>
                    <Select
                      onValueChange={(e) => {
                        handleSelectPeriode("year", e);
                      }}
                      value={selectPeriod.year as string}
                    >
                      <SelectTrigger className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]">
                        <SelectValue placeholder="Select Month" className="!text-gray-400" />
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
                  <div>
                    <Select
                      onValueChange={(e) => {
                        handleSelectPeriode("month", e);
                      }}
                      value={selectPeriod.month as string}
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
              </div>
            </CardHeader>
            <CardContent className="">
              <CustomTable headers={headers} data={activity?.data ?? []} isLoading={loadingActivity} />
            </CardContent>
            <CardFooter>
              <CustomPagination
                onPageChange={(e) => {
                  setPage(e);
                }}
                currentPage={page}
                showTotal
                hasPrevPage={activity?.pagination?.has_prev}
                hasNextPage={activity?.pagination?.has_next}
                totalItems={activity?.pagination?.total_items as number}
                totalPages={activity?.pagination?.total_pages as number}
                limit={10}
              />
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};
