"use client";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { SearchInput } from "@/components/ui/search-input";
import { sampleOrders } from "@/constants/sample-data";
import { IOrderItem } from "@/types/orders.interface";
import { CirclePlus, File, ListFilter, ReceiptText } from "lucide-react";
import { useState } from "react";

const tabOptions = [
  {
    value: "week",
    name: "Week",
  },
  {
    value: "month",
    name: "Month",
  },
  {
    value: "Year",
    name: "Year",
  },
];

export const OrdersPageView = () => {
  const [selecetedTab, setSelectedTab] = useState("week");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const headers = [
    {
      id: "orderId",
      text: "Order ID",
      value: "orderId",
    },
    {
      id: "customer",
      text: "Customer",
      value: "customer",
    },
    {
      id: "date",
      text: "Date",
      value: "date",
    },
    {
      id: "paymentMethod",
      text: "Payment Method",
      value: "paymentMethod",
    },
    {
      id: "amountReceived",
      text: "Amount Received",
      value: "amountReceived",
    },
    {
      id: "status",
      text: "Status",
      value: (row: IOrderItem) => <p className={row?.status === "Success" ? "text-green-400" : "text-red-500"}>{row.status}</p>,
    },
  ];
  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IOrderItem) => (
      <Button variant={"outline"} onClick={() => alert(row?.orderId)}>
        <ReceiptText />
      </Button>
    ),
  };
  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex  w-full flex-row justify-between items-center">
        <div>
          <GeneralTabComponent tabs={tabOptions} selecetedTab={selecetedTab} setTab={setSelectedTab} />
        </div>
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
            <Button className=" text-sm font-medium">
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
          <div className="flex">
            <SearchInput className="border-brand-100" />
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable
            data={sampleOrders.data}
            headers={headers}
            numberOptions={numberOptions}
            isLoading={false}
            // setSelectedData={setSelectedData}
            // selectedData={selectedData}

            actionOptions={actionOptions}
          />
        </CardContent>
        <CardFooter className="flex w-full">
          <CustomPagination
            onPageChange={(e) => setPage(e)}
            currentPage={page}
            showTotal
            nextPage={sampleOrders?.pagination?.nextPage}
            hasNextPage={sampleOrders?.pagination?.hasNextPage}
            hasPrevPage={sampleOrders?.pagination?.hasPrevPage}
            previousPage={sampleOrders?.pagination?.previousPage}
            totalItems={sampleOrders?.pagination?.totalItems as number}
            totalPages={sampleOrders?.pagination?.totalPages as number}
            limit={10}
          />
        </CardFooter>
      </Card>
    </div>
  );
};
