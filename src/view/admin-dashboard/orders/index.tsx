"use client";

import { DateRangePicker } from "@/components/base/date-range-picker";
import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { GeneralTabComponent } from "@/components/general/tabs-component";
import { SettleBalanceDialog, TransactionVoidDialog } from "@/components/page/orders";
import { PendingPaymentsTab } from "./pending-payments";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { SearchInput } from "@/components/ui/search-input";

import { useGetOrders, useGetOutstandingBalances } from "@/hooks/api/queries/admin/orders";
import { useAdminPermission } from "@/hooks/use-role-access";

import { defaultDate, formatCurrency, formatDateHelper, isTransactionVoidable, paymentMethodLabel } from "@/lib/helper";
import { IOrderItem } from "@/types/orders.interface";
import { SEHELA_BRANCH } from "@/constants/sample-data";
import { AlertTriangle, Ban, ChevronDown, CirclePlus, ReceiptText, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const OrdersPageView = () => {
  const [selectTrx, setSelectTrx] = useState("");
  const [selectSettle, setSelectSettle] = useState<IOrderItem | null>(null);
  const [outstandingOpen, setOutstandingOpen] = useState(true);
  const { isManager } = useAdminPermission();
  const router = useRouter();
  const [statusTab, setStatusTab] = useState("all");
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [openPreview, setOpenPreview] = useState(false);

  const [selectedRange, setSelectedRange] = useState({
    from: defaultDate().formattedOneMonthAgo,
    to: defaultDate().formattedToday,
  });

  const handleDateRangeChangeDual = (startDate: string, endDate?: string) => {
    setSelectedRange((prev) => ({ ...prev, from: startDate, to: endDate ?? "" }));
  };

  const { data, isLoading, refetch } = useGetOrders({
    page,
    limit,
    search,
    startDate: selectedRange.from,
    endDate: selectedRange.to,
    status: statusTab === "all" ? undefined : statusTab,
    branch: branch !== "all" ? branch : undefined,
  }, statusTab !== "pending");
  const { data: outstandingData, refetch: refetchOutstanding } = useGetOutstandingBalances();
  const outstanding = outstandingData?.data;
  const refreshOrders = () => {
    refetch();
    void refetchOutstanding();
  };

  const statusTabOptions = [
    { value: "all", name: "All" },
    { value: "pending", name: "Pending" },
    { value: "unpaid", name: "Unpaid / Partial" },
    { value: "voided", name: "Voided" },
    { value: "refunded", name: "Refunded" },
  ];

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
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
      text: "Created Date",
      value: (row: IOrderItem) => formatDateHelper(row?.date_purchased as string, "EEEE, dd MMM yyyy, H:mm"),
    },
    {
      id: "payment_method",
      text: "Payment Method",
      value: (row: IOrderItem) => (
        <p className="capitalize">
          {paymentMethodLabel(
            row?.payment_method === "transfer" && row?.transfer_details?.account_bank_to
              ? `transfer/${row.transfer_details.account_bank_to}`
              : row?.payment_method,
          )}
        </p>
      ),
    },
    {
      id: "branch",
      text: "Branch",
      value: (row: IOrderItem) => <p className="capitalize">{row?.branch ? String(row.branch).replace(/_/g, " ") : "-"}</p>,
    },
    {
      id: "price_idr",
      text: "Amount Received",
      value: (row: IOrderItem) => formatCurrency(row?.price_idr),
    },
    {
      id: "type",
      text: "Order Type",
      value: (row: IOrderItem) => <p className="capitalize">{row?.type}</p>,
    },
    {
      id: "status",
      text: "Status",
      value: (row: IOrderItem) => (
        <p
          className={`text-sm capitalize font-semibold ${
            row?.status === "paid" ? `text-green-500` : row?.status === "voided" ? "text-violet-800" : `text-red-500`
          }`}
        >
          {row?.status}
        </p>
      ),
    },
    {
      id: "balance_due",
      text: "Balance Due",
      value: (row: IOrderItem) =>
        (row?.balance_due_idr ?? 0) > 0 ? (
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-amber-600">{formatCurrency(row.balance_due_idr)}</span>
            <span className="text-xs text-gray-500">{row.balance_due_date ?? "-"}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];
  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IOrderItem) => (
      <div className="flex flex-row gap-2">
        <Button variant={"outline"} onClick={() => router.push(`orders/${row?.id}`)}>
          <ReceiptText />
        </Button>
        {(row?.balance_due_idr ?? 0) > 0 && isTransactionVoidable(row.status) ? (
          <Button onClick={() => setSelectSettle(row)} title="Settle Balance">
            <Wallet />
          </Button>
        ) : null}
        {isManager && isTransactionVoidable(row.status) ? (
          <Button
            variant={"destructive"}
            onClick={() => {
              // set modal trus for preview void
              setSelectTrx(row.id);
              setOpenPreview(true);
            }}
          >
            <Ban />
          </Button>
        ) : null}
      </div>
    ),
  };
  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex  w-full flex-row justify-between items-center">
        <div>
          <GeneralTabComponent
            tabs={statusTabOptions}
            selecetedTab={statusTab}
            setTab={(value) => {
              setStatusTab(value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          {/* <div className="flex w-full">
            <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
              <ListFilter /> Filter
            </Button>
          </div>
          <div className="flex w-full">
            <Button variant={"outline"} className="text-brand-999 text-sm font-medium">
              <File /> Export
            </Button>
          </div>{" "} */}
          <div className="flex w-full">
            <Button className=" text-sm font-medium" onClick={() => router.push("orders/add-transaction")}>
              <CirclePlus /> Add Transaction
            </Button>
          </div>
        </div>
      </div>
      {outstanding && outstanding.count > 0 && (
        <div className="rounded-lg border border-amber-200/70 bg-amber-50 text-sm text-amber-800">
          <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                <strong>{outstanding.count}</strong> {outstanding.count === 1 ? "transaction has" : "transactions have"} an unpaid or partial balance ·{" "}
                <span className="font-semibold">{formatCurrency(outstanding.total_balance_due_idr)} due</span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOutstandingOpen((open) => !open)}
              aria-label={outstandingOpen ? "Collapse balance details" : "Expand balance details"}
              aria-expanded={outstandingOpen}
              className="rounded-md p-1 transition-colors hover:bg-amber-100"
            >
              <ChevronDown className={`size-4 transition-transform duration-300 ${outstandingOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${outstandingOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3">
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    Due balance: <strong>{formatCurrency(outstanding.total_balance_due_idr)}</strong>
                  </span>
                  <span>
                    Next due: <strong>{outstanding.next_due_date ? formatDateHelper(outstanding.next_due_date, "dd MMM yyyy") : "-"}</strong>
                  </span>
                  <span>
                    Overdue: <strong>{outstanding.overdue_count}</strong>
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                  onClick={() => {
                    setStatusTab("unpaid");
                    setPage(1);
                  }}
                >
                  View transactions
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {statusTab === "pending" ? (
        <PendingPaymentsTab />
      ) : (
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Orders</h3>
            <p className="text-sm text-gray-500 font-normal">Recent orders from your store.</p>
          </div>
          <div className="flex flex-row  gap-2">
            <div>
              <Select
                value={branch}
                onValueChange={(v) => {
                  setBranch(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {SEHELA_BRANCH.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
      )}
      {openPreview && (
        <TransactionVoidDialog
          isOpen={openPreview}
          trxId={selectTrx}
          onClose={() => {
            setOpenPreview(false);
          }}
          refetchOrders={refreshOrders}
        />
      )}
      {selectSettle && (
        <SettleBalanceDialog
          paymentId={selectSettle.id}
          balanceDueIdr={selectSettle.balance_due_idr ?? 0}
          balanceDueDate={selectSettle.balance_due_date ?? null}
          onClose={() => setSelectSettle(null)}
          onSettled={refreshOrders}
        />
      )}
    </div>
  );
};
