"use client";
import { CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { CardRevenueComponent } from "@/components/page/dashboard/card-revenue";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetClassFlowReport } from "@/hooks/api/queries/admin/report/outstanding-credit";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { ICashFlowByPaymentMethod, ICashFlowTransaction } from "@/types/report.interface";
import { ArrowLeftRight, CircleDollarSign, Loader2, TicketX } from "lucide-react";
import { useState } from "react";

const COLORS = {
  transfer: "#3b82f6",
  cash: "#10b981",
  edc: "#f59e0b",
  midtrans: "#8b5cf6",
  credits: "#337582",
};

export const CashFlowView = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, refetch } = useGetClassFlowReport({ page, limit });

  const headers = [
    {
      id: "order_id",
      text: "Order ID",
      value: (row: ICashFlowTransaction) => (
        <a href={`/admin/orders/${row.id}`} target="_blank" className="text-brand-500 font-semibold underline">
          <p className="capitalize max-w-[70%] flex-wrap text-wrap">{row?.order_id}</p>
        </a>
      ),
    },
    {
      id: "amount",
      text: "Amount",
      value: (row: ICashFlowTransaction) => formatCurrency(row?.amount_idr),
    },
    {
      id: "payment_method",
      text: "Payment Method",
      value: (row: ICashFlowTransaction) => <p className="capitalize">{row.payment_method}</p>,
    },
    {
      id: "created_at",
      text: "Date",
      value: (row: ICashFlowTransaction) => formatDateHelper(row.created_at, "dd MMM yyyy H:mm"),
    },
    {
      id: "status",
      text: "Status",
      value: (row: ICashFlowTransaction) => (
        <Badge variant={"secondary"}>
          <p className="capitalize">{row.status}</p>
        </Badge>
      ),
    },
  ];

  const cashFlowTable = [
    {
      id: "payment_method",
      text: "Payment Method",
      value: (row: ICashFlowByPaymentMethod) => <p className="capitalize">{row.payment_method}</p>,
    },
    {
      id: "transaction_count",
      text: "Transaction Count",
      value: "transaction_count",
    },
    {
      id: "net",
      text: "Net",
      value: (row: ICashFlowByPaymentMethod) => formatCurrency(row.net),
    },
    {
      id: "outstanding",
      text: "Outstanding",
      value: (row: ICashFlowByPaymentMethod) => formatCurrency(row.outstanding),
    },
    {
      id: "refund",
      text: "Refund",
      value: (row: ICashFlowByPaymentMethod) => formatCurrency(row.refund),
    },
    {
      id: "collected",
      text: "Collected",
      value: (row: ICashFlowByPaymentMethod) => formatCurrency(row.collected),
    },
  ];

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-2xl font-semibold">Cash Flow | {formatDateHelper(new Date(), "EEEE, dd MMMM yyyy")}</h3>
          </div>
        </div>
      </div>
      <div className="flex flex-flex-row items-center justify-between gap-8">
        <CardRevenueComponent
          icon={
            <CircleDollarSign
              style={{
                color: "var(--color-gray-400)",
              }}
              size={18}
            />
          }
          title="Total Collected"
          amount={formatCurrency(data?.data?.summary.collected)}
          // percentage={20}
        />

        <CardRevenueComponent
          icon={
            <ArrowLeftRight
              style={{
                color: "var(--color-gray-400)",
              }}
              size={18}
            />
          }
          title="Total Transaction"
          amount={String(data?.data?.summary?.collected_count)}
          // percentage={20}
        />
        <CardRevenueComponent
          icon={
            <TicketX
              style={{
                color: "var(--color-gray-400)",
              }}
              size={18}
            />
          }
          title="Total Refunded"
          amount={formatCurrency(data?.data?.summary?.refund)}
          // percentage={20}
        />
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2  gap-6">
          {/* Payment Method Breakdown */}
          <Card className="">
            <CardHeader>
              <CardTitle>Payment Method Breakdown</CardTitle>
              <CardDescription>Distribution by payment method</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CustomTable headers={cashFlowTable} data={data?.data?.by_payment_method ?? []} />
            </CardContent>
          </Card>

          {/* Payment Methods Summary */}
          <Card className="">
            <CardHeader>
              <CardTitle>Payment Methods Summary</CardTitle>
              <CardDescription>Breakdown by method and count</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.data?.by_payment_method.map((method) => {
                const percentage = ((method.collected / data?.data?.summary?.collected) * 100).toFixed(1);
                return (
                  <div key={method.payment_method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[method.payment_method as keyof typeof COLORS],
                          }}
                        />
                        <span className="font-medium text-gray-700 capitalize">{method.payment_method}</span>
                      </div>
                      <span className="text-sm text-gray-600 capitalize">{method.payment_method} transactions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[method.payment_method as keyof typeof COLORS],
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 min-w-fit">{percentage}%</span>
                    </div>
                    <div className="text-sm text-gray-600">Rp {(method.collected / 1000000).toFixed(2)}M</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h3 className="text-xl text-brand-999 font-medium">Latest Payments</h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTable headers={headers} data={data?.data?.transactions ?? []} />
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
        </CardContent>
      </Card>
    </div>
  );
};
