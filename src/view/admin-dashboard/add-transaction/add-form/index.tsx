import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { GeneralTabComponent } from "@/components/general/tabs-component";

import { OrderCustomerSectionComponent } from "@/components/page/orders";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { SearchInput } from "@/components/ui/search-input";
import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";
import { defaultDate, formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";

import { ListFilter } from "lucide-react";
import { useState } from "react";
import { OrdersCartComponent } from "../order-card";
import { useGetSessions } from "@/hooks/api/queries/admin/class-session";
import { ISessionItem } from "@/types/class-sessions.interface";
import { CustomPagination } from "@/components/general/pagination-component";
import { DateRangePicker } from "@/components/base/date-range-picker";

const tableTabOption = [
  {
    value: "class",
    name: "Class",
  },
  {
    value: "buy_product",
    name: "Buy Product",
  },
  {
    value: "rent_product",
    name: "Rent Product",
  },
];

export const AddTransactionFOrm = () => {
  const { cartItems, addItem, removeItem, updateQuantity, customerData } = useAdminManualTransaction();

  const [tableTab, setTableTab] = useState("class");
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [selectedRange, setSelectedRange] = useState({
    from: defaultDate().formattedOneMonthAgo,
    to: defaultDate().formattedToday,
  });
  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const { data, isLoading } = useGetSessions({ page, limit, startDate: selectedRange.from, endDate: selectedRange.to, search });

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };

  // alwasy match/check cart data and table data for quantity
  const headers = [
    {
      id: "class",
      text: "Class",
      value: (row: ISessionItem) => row.class.class_name,
    },
    {
      id: "session_name",
      text: "Session",
      value: "session_name",
    },
    {
      id: "instructor_name",
      text: "Instructor",
      value: "instructor_name",
    },
    {
      id: "date",
      text: "Date",
      value: (row: ISessionItem) => formatDateHelper(row.start_date, "dd/MM/yyyy"),
    },
    {
      id: "slot",
      text: "Slot",
      value: (row: ISessionItem) => {
        const isFull = row.slots_booked === row.slots_total;

        return (
          <p
            className={cn("text-brand-999 font-semibold text-xs", {
              "text-red-500": isFull,
            })}
          >
            {row.slots_booked}/{row.slots_total}
          </p>
        );
      },
    },
    {
      id: "price",
      text: "Price",
      value: (row: ISessionItem) => formatCurrency(row.price_idr),
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
    render: (row: ISessionItem) => {
      const qty = cartItems?.find((item) => item.id === row.id)?.quantity;

      //count should taken from cartctx

      // update cart context state
      // cartdata is always empty from the start
      const onModifyQty = (id: number | string, type: "+" | "-") => {
        const item = cartItems?.find((item) => item.id === id);
        const currentQty = item?.quantity || 0;
        const newQty = type === "+" ? currentQty + 1 : currentQty - 1;

        const availableSlots = row.slots_total - row.slots_booked;
        if (type === "+" && newQty > availableSlots) {
          return;
        }

        if (newQty < 0) return;

        if (newQty === 0) {
          removeItem(id);
        } else if (item) {
          updateQuantity(id, newQty);
        } else {
          addItem({
            id: row.id,
            name: row.class.class_name,
            description: row.session_name,
            price: row.price_idr,
            quantity: 1,
            type: tableTab,
          });
        }
      };
      // const onModifyQty = (index: number, type: "+" | "-") => {
      //   //  1 customer 1 session id
      //   // check if there any index on cart ctx -- update
      //   // if count === 0 dont add to cartctx
      //   // if count > 0 add to cartctx
      //   //else there is none add new

      //   setCartData((prev) =>
      //     prev.map((item) => {
      //       if (item.id !== index) return item;

      //       const newQty = type === "+" ? item.quantity + 1 : item.quantity - 1;
      //       if (newQty < 1) return item;

      //       return { ...item, quantity: newQty };
      //     }),
      //   );
      // };
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
    <div className="grid grid-cols-3 gap-2 w-full pt-4">
      <div className="flex flex-col gap-4 col-span-2">
        <div className="flex w-full">
          <OrderCustomerSectionComponent />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row justify-between w-full">
            <div className="max-w-fit">
              <GeneralTabComponent tabs={tableTabOption} selecetedTab={tableTab} setTab={setTableTab} />
            </div>
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
              <CustomTable
                headers={headers}
                data={data?.data ?? []}
                numberOptions={numberOptions}
                actionOptions={actionOptions}
                isLoading={isLoading}
              />
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
        </div>
      </div>
      <OrdersCartComponent customerData={customerData} cartItems={cartItems} />
    </div>
  );
};
