/* eslint-disable @next/next/no-img-element */
"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { SearchInput } from "@/components/ui/search-input";

import { useGetOrders } from "@/hooks/api/queries/admin/orders";
import { useGetProductList } from "@/hooks/api/queries/admin/products";

import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { IOrderItem } from "@/types/orders.interface";
import { IProductItemList } from "@/types/product.interface";
import { CirclePlus, Ellipsis, File, ListFilter, ReceiptText } from "lucide-react";
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

export const ProductListPage = () => {
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

  const { data, isLoading } = useGetProductList({ page, limit, search });

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
      id: "cover",
      text: "Cover",
      value: (row: IProductItemList) => (
        <div className="flex h-16 w-16 border border-gray-200 bg-gray-200 rounded-md">
          <img src={row.photos?.[0]} alt={row.name} className="h-16 w-16" />
        </div>
      ),
    },
    {
      id: "name",
      text: "Name",
      value: "name",
    },
    {
      id: "category",
      text: "Category",
      value: (row: IProductItemList) => row?.category.name,
    },
    {
      id: "status",
      text: "Status",
      value: (row: IProductItemList) => (
        <div className={`grid col-span-9 capitalize ${row?.is_active ? `text-green-500` : `text-red-500`}`}>
          {row.is_active ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      id: "stock",
      text: "Stock",
      value: "stock",
    },
    {
      id: "created_at",
      text: "Created At",
      value: (row: IProductItemList) => formatDateHelper(row.created_at, "dd/MM/yyyy H:mm"),
    },
  ];
  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IProductItemList) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => alert(row.id)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert(row.id)}>Archive</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`instructor/${row.id}`)}>View Details</DropdownMenuItem>
          <DropdownMenuItem>Set as Inactive</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="" onClick={() => {}}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
            <Button className=" text-sm font-medium" onClick={() => router.push("products/create")}>
              <CirclePlus /> Add Products
            </Button>
          </div>
        </div>
      </div>
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Products</h3>
            <p className="text-sm text-gray-500 font-normal">Manage your products and view their sales performance</p>
          </div>
          <div className="flex flex-row  gap-2">
            <div>
              {/* <DateRangePicker onDateRangeChange={handleDateRangeChangeDual} startDate={selectedRange.from} endDate={selectedRange.to} /> */}
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
