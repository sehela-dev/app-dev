"use client";
import { DateRangePickerComponent } from "@/components/base/date-range-picker";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { GeneralTabComponent } from "@/components/general/tabs-component";

import { OrderCustomerSectionComponent } from "@/components/page/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { SearchInput } from "@/components/ui/search-input";
import { detailSampleOrder, sampleClassData } from "@/constants/sample-data";
import { formatCurrency } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IClassData } from "@/types/orders.interface";
import { ScrollArea } from "@radix-ui/react-scroll-area";

import { format, subMonths } from "date-fns";
import { ListFilter, ShoppingCart } from "lucide-react";
import { Fragment, useState } from "react";

// Get date from one month ago
// Get today's date
const today = new Date();

// Get date from one month ago
const oneMonthAgo = subMonths(today, 1);

// Format the dates (you can customize the format string)
const formattedToday = format(today, "yyyy-MM-dd");
const formattedOneMonthAgo = format(oneMonthAgo, "yyyy-MM-dd");

const tableTabOption = [
  {
    value: "class",
    name: "Class",
  },
  {
    value: "buy",
    name: "Buy Product",
  },
  {
    value: "rent",
    name: "Rent Product",
  },
];

export const AddTransactionPage = () => {
  const [tableTab, setTableTab] = useState("class");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedRange, setSelectedRange] = useState({
    from: formattedOneMonthAgo,
    to: formattedToday,
  });
  const handleDateRangeChangeDual = (start: string, end: string) => {
    setSelectedRange((prev) => ({ ...prev, from: start, to: end }));
  };

  const numberOptions = {
    text: "No",
    show: false,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const headers = [
    {
      id: "class",
      text: "Class",
      value: "class",
    },
    {
      id: "session",
      text: "Session",
      value: "session",
    },
    {
      id: "instructor",
      text: "Instructor",
      value: "instructor",
    },
    {
      id: "date",
      text: "Date",
      value: "date",
    },
    {
      id: "slot",
      text: "Slot",
      value: (row: IClassData) => {
        const isFull = row.joined === row.capacity;

        return (
          <p
            className={cn("text-brand-999 font-semibold text-xs", {
              "text-red-500": isFull,
            })}
          >
            {row.joined}/{row.capacity}
          </p>
        );
      },
    },
    {
      id: "price",
      text: "Price",
      value: "price",
    },
  ];

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IClassData) => (
      <Button onClick={() => alert(row?.id)} className="w-8 h-8" variant={"secondary"} disabled={row.joined >= row.capacity}>
        <ShoppingCart />
      </Button>
    ),
  };
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center">
        <div className="flex flex-col w-full">
          <h3 className=" text-brand-999 text-3xl font-semibold">Add Transaction</h3>
          <p className="text-sm font-normal text-gray-500">Manually input transaction data for in-person purchases.</p>
        </div>
        <div className="max-w-9 max-h-9 w-full h-full  border  border-brand-100 rounded-full items-center justify-center p-2 ">
          <p className="text-[10px] font-semibold text-gray-500 leading-5 text-center">1/2</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full pt-4">
        <div className="flex flex-col gap-4 col-span-2">
          <div className="flex w-full">
            <OrderCustomerSectionComponent />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-between w-full">
              <GeneralTabComponent tabs={tableTabOption} selecetedTab={tableTab} setTab={setTableTab} />
              <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
                <ListFilter /> Filter
              </Button>
            </div>
            <Card className="border-brand-100 w-full">
              <CardHeader className="flex flex-row justify-between w-ful items-center">
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl text-brand-999 font-medium">Classes</h3>
                  <p className="text-sm text-gray-500">Enter customer information to book a class</p>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="flex  min-w-[60%] w-full">
                    <DateRangePickerComponent
                      onDateRangeChange={handleDateRangeChangeDual}
                      startDate={selectedRange.from}
                      endDate={selectedRange.to}
                    />
                  </div>
                  <div className="flex w-full">
                    <SearchInput />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="">
                <CustomTable headers={headers} data={sampleClassData.data} numberOptions={numberOptions} actionOptions={actionOptions} />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex w-full  h-fit">
          <Card className="border-brand-100 w-full">
            <CardHeader>
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl text-brand-999 font-medium">Orders</h3>
                <p className="text-sm text-gray-500">Order summary and total bill</p>
              </div>
              <hr style={{ color: "var(--color-brand-100" }} className="my-2" />
            </CardHeader>

            <CardContent className="">
              <div className="grid gap-2">
                <div className="grid grid-cols-2">
                  <p className="text-brand-999 font-semibold text-sm">Customer Information</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-gray-500  text-sm">Customer</p>
                  <p className="text-brand-999 text-right text-sm">{detailSampleOrder?.customer?.name}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-gray-500  text-sm">Phone</p>
                  <p className="text-brand-999 text-right text-sm">{detailSampleOrder?.customer?.phone}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-gray-500  text-sm">Email</p>
                  <p className="text-brand-999 text-right text-sm">{detailSampleOrder?.customer?.email}</p>
                </div>
                <hr style={{ color: "var(--color-brand-100" }} className="my-2" />
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2">
                  <p className="text-gray-500 font-medium text-sm">Item</p>
                  <p className="text-gray-500 font-medium text-sm text-right">Price & Qty</p>
                </div>
                <hr style={{ color: "var(--color-brand-100" }} className="my-2" />
                <ScrollArea className="min-h-[250px] max-h-[400px] space-y-4">
                  {detailSampleOrder?.items?.map((item) => (
                    <Fragment key={item.id}>
                      <div className="grid grid-cols-2 items-center">
                        <div className="flex flex-row items-center gap-2">
                          {item.badge && (
                            <Badge className="border bg-brand-100 min-w-[18px] h-[18px] text-[10px] border-brand-400 !p-1.5 ">{item.badge}</Badge>
                          )}
                          <div>
                            <p className="text-brand-999 font-medium text-sm">{item.name}</p>
                            <p className="text-gray-500 font-medium text-sm">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-row gap-2 justify-end items-center">
                          <div className="flex flex-col justify-center">
                            <p className="text-brand-999 font-medium text-sm text-right">{formatCurrency(item.price)}</p>
                            <p className="text-brand-999 font-medium text-sm text-right">X{item.quantity}</p>
                          </div>
                        </div>
                      </div>
                      <hr style={{ color: "var(--color-brand-100" }} />
                    </Fragment>
                  ))}
                </ScrollArea>
                <div className="grid grid-cols-2">
                  <p className="text-brand-999 font-bold text-sm">TOTAL</p>
                  <p className="text-brand-999 font-bold text-sm text-right">{formatCurrency(detailSampleOrder.total)}</p>
                </div>
                <div className="flex flex-row w-full items-center gap-2 py-4">
                  <div className="flex w-full">
                    <Button variant={"secondary"} className="flex w-full">
                      Cancel
                    </Button>
                  </div>
                  <div className="fle w-full">
                    <Button className="flex w-full">Continue</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
