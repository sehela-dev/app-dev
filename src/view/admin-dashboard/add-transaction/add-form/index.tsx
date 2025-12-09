import { DateRangePickerComponent } from "@/components/base/date-range-picker";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { GeneralTabComponent } from "@/components/general/tabs-component";

import { OrderCustomerSectionComponent } from "@/components/page/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { SearchInput } from "@/components/ui/search-input";
import { detailSampleOrder, sampleClassData } from "@/constants/sample-data";
import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IClassData } from "@/types/orders.interface";

import { ScrollArea } from "@radix-ui/react-scroll-area";

import { format, subMonths } from "date-fns";
import { ListFilter, ShoppingCart } from "lucide-react";
import { Fragment, useState } from "react";
import { OrdersCartComponent } from "../order-card";

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

export const AddTransactionFOrm = () => {
  const { cartItems, addItem, removeItem, updateQuantity, updateItem, clearCart, getTotal, getTotalItems, addCustomer, customerData, updateStepper } =
    useAdminManualTransaction();
  console.log(cartItems);
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

  // alwasy match/check cart data and table data for quantity
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
      value: (row: IClassData) => formatDateHelper(row.date, "dd/MM/yyyy"),
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
      value: (row: IClassData) => formatCurrency(row.price),
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
    render: (row: IClassData) => {
      const qty = cartItems?.find((item) => item.id === row.id)?.quantity;

      //count should taken from cartctx

      // update cart context state
      // cartdata is always empty from the start
      const onModifyQty = (id: number | string, type: "+" | "-") => {
        const item = cartItems?.find((item) => item.id === id);
        const currentQty = item?.quantity || 0;
        const newQty = type === "+" ? currentQty + 1 : currentQty - 1;

        const availableSlots = row.capacity - row.joined;
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
            name: `${row.class}`,
            description: row.session,
            price: parseInt(row.price),
            quantity: 1,
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
                  <DateRangePickerComponent onDateRangeChange={handleDateRangeChangeDual} startDate={selectedRange.from} endDate={selectedRange.to} />
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
      <OrdersCartComponent customerData={customerData} cartItems={cartItems} />
    </div>
  );
};
