import { buildNumber, CustomTable } from "@/components/general/custom-table";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { SearchInput } from "@/components/ui/search-input";
import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";
import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";

import { useState } from "react";

import { ISessionItem } from "@/types/class-sessions.interface";
import { CustomPagination } from "@/components/general/pagination-component";
import { DateRangePicker } from "@/components/base/date-range-picker";
import { useDebounce } from "@/hooks";
import { useGetCreditPackage } from "@/hooks/api/queries/admin/credit-package";
import { ICreditPackageItem } from "@/types/credit-package.interface";

export const CreditPackageTabComponent = () => {
  const { cartItems, addItem, removeItem, updateQuantity, customerData } = useAdminManualTransaction();

  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounceClass = useDebounce(search, 300);

  const [selectedRange, setSelectedRange] = useState({
    from: defaultDate().formattedOneMonthAgo,
    to: defaultDate().formattedToday,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const { data, isLoading } = useGetCreditPackage({ page, limit, startDate: selectedRange.from, endDate: selectedRange.to, search: debounceClass });

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };

  // alwasy match/check cart data and table data for quantity
  const headers = [
    {
      id: "name",
      text: "Package Name",
      value: "name",
    },

    {
      id: "class_ids_restriction",
      text: "Class",
      value: (row: ICreditPackageItem) => (
        <p className="capitalize max-w-[70%] flex-wrap text-wrap">
          {row.class_ids_restriction?.length > 0 ? row?.class_ids_restriction.map((item) => item.name).join(", ") : "All Class"}
        </p>
      ),
    },
    {
      id: "credits",
      text: "Amount",
      value: (row: ICreditPackageItem) => <p>{row.credits} Credits</p>,
    },
    {
      id: "price_idr",
      text: "Regular Price",
      value: (row: ICreditPackageItem) => formatCurrency(row?.price_idr),
    },
    {
      id: "is_shareable",
      text: "Sharing",
      value: (row: ICreditPackageItem) => (row?.is_shareable ? "Yes" : "No"),
    },
    {
      id: "validity_days",
      text: "Valid for",
      value: (row: ICreditPackageItem) => <p>{row.validity_days} Days</p>,
    },
    {
      id: "status",
      text: "Status",
      value: (row: ICreditPackageItem) => (
        <p className={row?.is_active ? "text-green-400 uppercase" : "text-red-500 uppercasex"}>{row?.is_active ? "Active" : "Inactive"}</p>
      ),
    },
  ];

  const numberOptions = {
    text: "No",
    show: false,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const actionOptions = {
    text: "Qty",
    show: true,
    render: (row: ICreditPackageItem) => {
      const qty = cartItems?.find((item) => item.id === row.id)?.quantity;

      //count should taken from cartctx

      // update cart context state
      // cartdata is always empty from the start
      const onModifyQty = (id: number | string, type: "+" | "-") => {
        const item = cartItems?.find((item) => item.id === id);
        const currentQty = item?.quantity || 0;
        const newQty = type === "+" ? currentQty + 1 : currentQty - 1;

        if (newQty < 0) return;

        if (newQty === 0) {
          removeItem(id);
        } else if (item) {
          updateQuantity(id, newQty);
        } else {
          addItem({
            id: row.id,
            name: row.name,
            description: row.class_ids_restriction?.map((item) => item.name).join("") ?? "",
            price: row.price_idr,
            quantity: 1,
            type: "packages",
            badge: row.is_shareable ? "Sharing" : "",
          });
        }
      };

      return (
        <div className="text-brand-999 font-medium text-sm text-center col-span-1">
          {" "}
          <div className="flex flex-row gap-2 items-center justify-center">
            <Button variant={"outline"} className="bg-transparent w-8 h-8" onClick={() => onModifyQty(row.id, "-")}>
              -
            </Button>
            <div className="w-8 h-8 flex items-center justify-center bg-brand-100 rounded-md">{qty ?? 0}</div>

            <Button variant={"outline"} className="bg-transparent w-8 h-8" onClick={() => onModifyQty(row.id, "+")}>
              +
            </Button>
          </div>
        </div>
      );
    },
  };
  return (
    <Card className="border-brand-100 w-full">
      <CardHeader className="flex flex-row justify-between w-ful items-center">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl text-brand-999 font-medium">Credit Package</h3>
          <p className="text-sm text-gray-500">Enter customer information to buy credit(s)</p>
        </div>
        <div className="flex flex-row gap-2">
          <div className="flex  min-w-[60%] w-full">
            <DateRangePicker
              mode="range"
              onDateRangeChange={handleDateRangeChangeDual}
              startDate={selectedRange.from}
              endDate={selectedRange.to}
              allowFutureDates
              allowPastDates={false}
            />
          </div>
          <div className="flex w-full">
            <SearchInput className="border-brand-100" search={search} onSearch={handleSearch} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="">
        <CustomTable headers={headers} data={data?.data ?? []} numberOptions={numberOptions} actionOptions={actionOptions} isLoading={isLoading} />
      </CardContent>
      <CardFooter>
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
  );
};
