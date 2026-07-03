"use client";
import { CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { CardRevenueComponent } from "@/components/page/dashboard/card-revenue";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetClassFlowReport } from "@/hooks/api/queries/admin/report/outstanding-credit";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { ICashFlowTransaction } from "@/types/report.interface";
import { ArrowLeftRight, CircleDollarSign, TicketX } from "lucide-react";
import { useState } from "react";

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
