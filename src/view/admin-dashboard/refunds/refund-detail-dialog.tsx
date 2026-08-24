"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApproveRefund, useRejectRefund } from "@/hooks/api/mutations/admin";
import { useGetRefundDetail } from "@/hooks/api/queries/admin/refunds";
import { useAdminPermission } from "@/hooks/use-role-access";
import { formatCurrency, formatDateHelper, isTransactionVoidable } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { IRefundItem } from "@/types/refund.interface";
import { Check, Loader2, Undo2, X } from "lucide-react";
import { movementTypeClass, movementTypeLabel, refundStatusClass, refundStatusLabel } from "./refund-status";

interface RefundDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  refundId: string;
  onSuccess?: () => void;
}

export const RefundDetailDialog = ({ isOpen, onClose, refundId, onSuccess }: RefundDetailDialogProps) => {
  const { can } = useAdminPermission();
  const { data, isLoading, refetch } = useGetRefundDetail(refundId);
  const { mutateAsync: approve, isPending: approving } = useApproveRefund();
  const { mutateAsync: reject, isPending: rejecting } = useRejectRefund();
  const [reviewNote, setReviewNote] = useState("");

  const refund = data?.data as IRefundItem | undefined;

  const isReviewed = !refund?.status || refund.status !== "requested";
  const isPaymentTerminal = !!refund?.payment && !isTransactionVoidable(refund.payment.status);
  const canReview = (can("refund:approve") || can("refund:reject")) && !isPaymentTerminal;
  const isReviewing = approving || rejecting;

  const customerName = refund?.booking?.customer_name ?? refund?.payment?.customer_name ?? "-";
  const customerEmail = refund?.booking?.customer_email ?? refund?.payment?.customer_email;

  const onReview = async (action: "approve" | "reject") => {
    if (!refund) return;
    const id = refund.id;
    const note = reviewNote.trim() || undefined;
    const res = action === "approve" ? await approve({ id, note }) : await reject({ id, note });
    if (res) {
      setReviewNote("");
      refetch();
      onSuccess?.();
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="min-w-[55vw] max-h-[85vh] overflow-y-auto font-sans">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-brand-500 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Undo2 size={20} />
              Refund Detail
            </span>
            {refund ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("capitalize", movementTypeClass(refund.movement_type ?? refund.payment?.movement_type))}>
                  {movementTypeLabel(refund.movement_type ?? refund.payment?.movement_type)}
                </Badge>
                <Badge variant="outline" className={cn("capitalize", refundStatusClass(refund.status))}>
                  {refundStatusLabel(refund.status)}
                </Badge>
              </div>
            ) : null}
          </AlertDialogTitle>
        </AlertDialogHeader>

        {isLoading || !refund ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading refund detail...</div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 rounded-lg border border-brand-100 p-4">
              <p className="font-medium text-foreground">{customerName}</p>
              {customerEmail && <p className="text-xs text-muted-foreground">{customerEmail}</p>}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Refund Amount</span>
                  <span className="font-semibold text-foreground">{formatCurrency(refund.amount_idr)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{refund.booking?.payment_method ?? refund.payment?.provider ?? "-"}</span>
                </div>
                {refund.booking?.session ? (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Session</span>
                    <span>{refund.booking.session.session_name}</span>
                  </div>
                ) : null}
                {refund.booking?.session?.start_datetime ? (
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Session Date</span>
                    <span>{formatDateHelper(refund.booking.session.start_datetime, "dd/MM/yyyy HH:mm")}</span>
                  </div>
                ) : null}
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Requested At</span>
                  <span>{refund.requested_at ? formatDateHelper(refund.requested_at, "dd/MM/yyyy HH:mm") : "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Confirmed At</span>
                  <span>{refund.confirmed_at ? formatDateHelper(refund.confirmed_at, "dd/MM/yyyy HH:mm") : "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Reviewer</span>
                  <span className="capitalize">{refund.reviewer_name ?? "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Refund Type</span>
                  <span className="capitalize">{refund.refund_type?.replace(/_/g, " ")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Movement</span>
                  <span>
                    <Badge variant="outline" className={cn("capitalize", movementTypeClass(refund.movement_type ?? refund.payment?.movement_type))}>
                      {movementTypeLabel(refund.movement_type ?? refund.payment?.movement_type)}
                    </Badge>
                  </span>
                </div>
              </div>
              {refund.reason ? (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Reason</span>
                  <span className="text-sm text-foreground">{refund.reason}</span>
                </div>
              ) : null}
              {refund.reviewer_note ? (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Reviewer Note</span>
                  <span className="text-sm text-foreground">{refund.reviewer_note}</span>
                </div>
              ) : null}
            </div>
{!isReviewed && isPaymentTerminal && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                This transaction is already <span className="font-semibold capitalize">{refund?.payment?.status}</span> and can no longer be
                approved or refunded.
              </div>
            )}
            {!isReviewed && canReview && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="review-note">Review note (optional)</Label>
                <Textarea
                  id="review-note"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="Type here.."
                  disabled={isReviewing}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <Divider />

        <div className="flex w-full flex-row gap-2.5">
          <div className="w-full">
            <Button type="button" variant="secondary" className="w-full" onClick={onClose} disabled={isReviewing}>
              Close
            </Button>
          </div>
          {!isReviewed && canReview && (
            <>
              {can("refund:reject") && (
                <div className="w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-red-500 text-red-600"
                    onClick={() => onReview("reject")}
                    disabled={isReviewing}
                  >
                    {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X />} Reject
                  </Button>
                </div>
              )}
              {can("refund:approve") && (
                <div className="w-full">
                  <Button type="button" className="w-full bg-green-600 hover:bg-green-700" onClick={() => onReview("approve")} disabled={isReviewing}>
                    {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check />} Approve
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
