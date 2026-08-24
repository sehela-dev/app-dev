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
import { IRefundItem, RefundMovementFilter, RefundStatus } from "@/types/refund.interface";
import { Clock3, CheckCircle, Undo2, Ban, Eye, Info, ChevronDown } from "lucide-react";
import { useState } from "react";
import { movementTypeClass, movementTypeLabel, refundStatusClass, refundStatusLabel } from "./refund-status";
import { RefundDetailDialog } from "./refund-detail-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const STATUS_FILTERS: { value: RefundStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "requested", label: "Requested" },
  { value: "succeeded", label: "Approved" },
  { value: "failed", label: "Rejected" },
];

const MOVEMENT_FILTERS: { value: RefundMovementFilter; label: string }[] = [
  { value: "all", label: "All Movements" },
  { value: "refund", label: "Refund" },
  { value: "voided", label: "Voided" },
  { value: "collected", label: "Collected" },
  { value: "outstanding", label: "Outstanding" },
];

export const RefundManagementPageView = () => {
  const [limit] = useState(20);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<RefundStatus | "all">("all");
  const [movement, setMovement] = useState<RefundMovementFilter>("all");
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const { data, isLoading, refetch } = useGetRefunds({ page, limit, status, movement_type: movement });

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
      id: "movement_type",
      text: "Movement",
      value: (row: IRefundItem) => (
        <Badge variant="outline" className={cn("capitalize", movementTypeClass(row.movement_type ?? row.payment?.movement_type))}>
          {movementTypeLabel(row.movement_type ?? row.payment?.movement_type)}
        </Badge>
      ),
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
      <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
        <Card className="rounded-lg border-brand-100 bg-white">
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/20 transition-colors select-none">
              <div className="flex items-center gap-2 w-full">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Info className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-semibold text-brand-900">What do the filters mean?</h4>
                  <p className="text-xs text-muted-foreground">Use the two filters above to find exactly what you need. Click to {infoOpen ? "hide" : "learn more"}.</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", infoOpen && "rotate-180")} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Two filters explained */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border bg-brand-50/50 p-3">
                  <p className="font-semibold text-brand-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Review Status
                  </p>
                  <p className="mt-1 text-muted-foreground">Did admin approve it?</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={cn("text-[11px]", refundStatusClass("requested"))}>
                      Requested
                    </Badge>
                    <span className="text-muted-foreground text-[11px]">→ waiting for you</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={cn("text-[11px]", refundStatusClass("succeeded"))}>
                      Approved
                    </Badge>
                    <Badge variant="outline" className={cn("text-[11px]", refundStatusClass("failed"))}>
                      Rejected
                    </Badge>
                  </div>
                </div>
                <div className="rounded-lg border bg-blue-50/30 p-3">
                  <p className="font-semibold text-brand-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" /> Movement
                  </p>
                  <p className="mt-1 text-muted-foreground">What happened to the money?</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={cn("text-[11px]", movementTypeClass("outstanding"))}>
                      outstanding
                    </Badge>
                    <Badge variant="outline" className={cn("text-[11px]", movementTypeClass("collected"))}>
                      collected
                    </Badge>
                    <Badge variant="outline" className={cn("text-[11px]", movementTypeClass("refund"))}>
                      refund
                    </Badge>
                    <Badge variant="outline" className={cn("text-[11px]", movementTypeClass("voided"))}>
                      voided
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Movement meanings - admin friendly */}
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex gap-3 rounded-lg border p-3 bg-white">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      Outstanding{" "}
                      <Badge variant="outline" className={cn("text-[11px] capitalize", movementTypeClass("outstanding"))}>
                        outstanding
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">Payment not yet received. Booking was created but customer hasn&apos;t paid.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3 bg-white">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      Collected{" "}
                      <Badge variant="outline" className={cn("text-[11px] capitalize", movementTypeClass("collected"))}>
                        collected
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">Money received. Payment was successful.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3 bg-white">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Undo2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      Refund{" "}
                      <Badge variant="outline" className={cn("text-[11px] capitalize", movementTypeClass("refund"))}>
                        refund
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">Money was returned. Customer got their money back.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3 bg-white">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                    <Ban className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      Voided{" "}
                      <Badge variant="outline" className={cn("text-[11px] capitalize", movementTypeClass("voided"))}>
                        voided
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">Canceled — no money moved. Booking was voided before payment.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-brand-900">Try this:</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Want to see <b>approved refunds where money actually went out</b>? Select <b>Approved</b> + <b>Refund</b>.
                  <br />
                  Want <b>pending requests that are already paid</b>? Select <b>Requested</b> + <b>Collected</b>.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card className="rounded-lg border-brand-100">
        <CardHeader className="flex flex-row w-full justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-brand-999 text-2xl font-semibold">Refund Management</h3>
            <p className="text-sm text-gray-500 font-normal">Review and approve manual cash refund requests.</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="w-[200px]">
              <Select
                value={movement}
                onValueChange={(value) => {
                  setMovement(value as RefundMovementFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by movement" />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_FILTERS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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