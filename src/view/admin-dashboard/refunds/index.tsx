"use client";

import { buildNumber, CustomTable } from "@/components/general/custom-table";
import { CustomPagination } from "@/components/general/pagination-component";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useGetRefunds } from "@/hooks/api/queries/admin/refunds";

import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IRefundItem, RefundStatus } from "@/types/refund.interface";
import { Eye } from "lucide-react";
import { useState } from "react";
import { refundStatusClass, refundStatusLabel } from "./refund-status";
import { RefundDetailDialog } from "./refund-detail-dialog";

const STATUS_FILTERS: { value: RefundStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "requested", label: "Requested" },
  { value: "succeeded", label: "Approved" },
  { value: "failed", label: "Rejected" },
];

export const RefundManagementPageView = () => {
  const [limit] = useState(20);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<RefundStatus | "all">("all");
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const { data, isLoading, refetch } = useGetRefunds({ page, limit, status });

  const numberOptions = {
    text: "No",
    show: true,
    render: (_: unknown, idx: number) => buildNumber(idx, limit, page),
  };

  const headers = [
    {
      id: "customer_name",
      text: "Customer",
      value: (row: IRefundItem) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{row.booking?.customer_name ?? row.payment?.customer_name ?? "-"}</p>
          <p className="text-xs text-muted-foreground">{row.booking?.customer_email ?? row.payment?.customer_email}</p>
        </div>
      ),
    },
    {
      id: "session",
      text: "Session",
      value: (row: IRefundItem) => (
        <div className="flex flex-col">
          <p className="font-medium text-foreground">{row.booking?.session?.session_name ?? "-"}</p>
          <p className="text-xs text-muted-foreground">
            {row.booking?.session?.start_datetime ? formatDateHelper(row.booking.session.start_datetime, "dd/MM/yyyy HH:mm") : "-"}
          </p>
        </div>
      ),
    },
    {
      id: "payment_method",
      text: "Payment Method",
      value: (row: IRefundItem) => <p className="capitalize">{row.booking?.payment_method ?? row.payment?.provider ?? "-"}</p>,
    },
    {
      id: "amount_idr",
      text: "Refund Amount",
      value: (row: IRefundItem) => <p className="font-medium text-foreground">{formatCurrency(row.amount_idr)}</p>,
    },
    {
      id: "requested_at",
      text: "Requested At",
      value: (row: IRefundItem) => formatDateHelper(row.requested_at, "dd/MM/yyyy HH:mm"),
    },
    {
      id: "confirmed_at",
      text: "Confirmed At",
      value: (row: IRefundItem) => (row.confirmed_at ? formatDateHelper(row.confirmed_at, "dd/MM/yyyy HH:mm") : "-"),
    },
    {
      id: "reviewer_name",
      text: "Reviewer",
      value: (row: IRefundItem) => <p className="capitalize">{row.reviewer_name ?? "-"}</p>,
    },
    {
      id: "status",
      text: "Status",
      value: (row: IRefundItem) => (
        <Badge variant="outline" className={cn("capitalize", refundStatusClass(row.status))}>
          {refundStatusLabel(row.status)}
        </Badge>
      ),
    },
  ];

  const actionOptions = {
    text: "Action",
    show: true,
    render: (row: IRefundItem) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setSelectedRefundId(row.id);
          setOpenDetail(true);
        }}
      >
        <Eye /> View Detail
      </Button>
    ),
  };

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Refund Management</h3>
            <p className="text-sm text-gray-500 font-normal">Review and approve manual cash refund requests.</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="w-[200px]">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as RefundStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable data={data?.data ?? []} headers={headers} numberOptions={numberOptions} isLoading={isLoading} actionOptions={actionOptions} />
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

      {openDetail && selectedRefundId && (
        <RefundDetailDialog
          isOpen={openDetail}
          refundId={selectedRefundId}
          onClose={() => {
            setOpenDetail(false);
            setSelectedRefundId(null);
          }}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};