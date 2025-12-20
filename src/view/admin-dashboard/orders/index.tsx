"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { SearchInput } from "@/components/ui/search-input";

import { useGetOrders } from "@/hooks/api/queries/admin/orders";

import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { IOrderItem } from "@/types/orders.interface";
import { CirclePlus, File, ListFilter, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// const tabOptions = [
//   {
//     value: "week",
//     name: "Week",
//   },
//   {
//     value: "month",
//     name: "Month",
//   },
//   {
//     value: "Year",
//     name: "Year",
//   },
// ];

export const OrdersPageView = () => {
  const router = useRouter();
  // const [selecetedTab, setSelectedTab] = useState("week");
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selectedRange, setSelectedRange] = useState({
    from: defaultDate().formattedOneMonthAgo,
    to: defaultDate().formattedToday,
  });

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };

  const { data, isLoading } = useGetOrders({ page, limit, search, startDate: selectedRange.from, endDate: selectedRange.to });

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const headers = [
    {
      id: "order_id",
      text: "Order ID",
      value: "order_id",
    },
    {
      id: "customer_name",
      text: "Customer",
      value: "customer_name",
    },
    {
      id: "date_purchased",
      text: "Date",
      value: (row: IOrderItem) => formatDateHelper(row?.date_purchased as string, "dd MMM yyyy"),
    },
    {
      id: "payment_method",
      text: "Payment Method",
      value: (row: IOrderItem) => <p className="capitalize">{row?.payment_method}</p>,
    },
    {
      id: "price_idr",
      text: "Amount Received",
      value: (row: IOrderItem) => formatCurrency(row?.price_idr),
    },
    {
      id: "status",
      text: "Status",
      value: (row: IOrderItem) => <p className={row?.status === "paid" ? "text-green-400 uppercase" : "text-red-500 uppercasex"}>{row.status}</p>,
    },
  ];
  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IOrderItem) => (
      <Button variant={"outline"} onClick={() => router.push(`orders/${row?.id}`)}>
        <ReceiptText />
      </Button>
    ),
  };
  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex  w-full flex-row justify-between items-center">
        <div>{/* <GeneralTabComponent tabs={tabOptions} selecetedTab={selecetedTab} setTab={setSelectedTab} /> */}</div>
        <div className="flex flex-row items-center gap-2">
          <div className="flex w-full">
            <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
              <ListFilter /> Filter
            </Button>
          </div>
          <div className="flex w-full">
            <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
              <File /> Export
            </Button>
          </div>{" "}
          <div className="flex w-full">
            <Button className=" text-sm font-medium" onClick={() => router.push("orders/add-transaction")}>
              <CirclePlus /> Add Transaction
            </Button>
          </div>
        </div>
      </div>
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Orders</h3>
            <p className="text-sm text-gray-500 font-normal">Recent orders from your store.</p>
          </div>
          <div className="flex flex-row  gap-2">
            <div>
              <DateRangePicker onDateRangeChange={handleDateRangeChangeDual} startDate={selectedRange.from} endDate={selectedRange.to} />
            </div>
            <SearchInput className="border-brand-100" search={search} onSearch={handleSearch} />
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable
            data={data?.data ?? []}
            headers={headers}
            numberOptions={numberOptions}
            isLoading={isLoading}
            // setSelectedData={setSelectedData}
            // selectedData={selectedData}

            actionOptions={actionOptions}
          />
        </CardContent>
        <CardFooter className="flex w-full">
          <CustomPagination
            onPageChange={(e) => {
              setPage(e);
            }}
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
