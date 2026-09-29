"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeftRight, Ban, Loader2 } from "lucide-react";

import { useDeleteSession, usePreviewSessionCancel } from "@/hooks/api/mutations/admin";
import { cn } from "@/lib/utils";
import {
  ISessionCancelCommit,
  ISessionCancelPreview,
  ISessionCancelPreviewBooking,
  TSessionCancelRefundType,
} from "@/types/class-sessions.interface";
import { BaseDialogComponent } from "./base-dialog-component";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";

interface ICancelSessionDialog {
  sessionId: string;
  sessionName?: string;
  open: boolean;
  onClose: () => void;
  onCommitted?: () => void;
}

function refundDetail(row: ISessionCancelPreviewBooking): string | null {
  const to = row.refund_to;
  if (!to || to.kind === "none" || row.refund_type === "none") return null;
  if (to.kind === "original_package") {
    const days = typeof to.days_remaining === "number" ? `, ${to.days_remaining} days left` : "";
    return `${to.package_name}${days}`;
  }
  const validity = typeof to.validity_days === "number" ? `, valid ${to.validity_days} days` : "";
  return `${to.package_name} · ${to.credits} credit${validity}`;
}

function paymentMeta(row: ISessionCancelPreviewBooking): { label: string; cls: string } {
  const method = (row.payment_method ?? "").toLowerCase();
  const source = (row.source_platform ?? "").toLowerCase();
  if (method === "credits") return { label: "Credits", cls: "border-brand-200 bg-brand-25 text-brand-700" };
  if (source) {
    const label = row.source_platform as string;
    if (source === "midtrans") return { label: "Midtrans", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
    return { label, cls: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  if (method === "midtrans") return { label: "Midtrans", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (method === "cash") return { label: "Cash", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  return { label: row.payment_method ?? "-", cls: "" };
}

function outcomeMeta(row: ISessionCancelPreviewBooking): { label: string; cls: string } {
  if (!row.refund_to || row.refund_to.kind === "none" || row.refund_type === "none")
    return { label: "No refund", cls: "border-gray-200 bg-gray-100 text-gray-600" };
  if (row.refund_to.kind === "original_package")
    return { label: "Return to package", cls: "border-brand-200 bg-brand-25 text-brand-700" };
  return { label: "New credit", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" };
}

export const CancelSessionDialog = ({ sessionId, sessionName, open, onClose, onCommitted }: ICancelSessionDialog) => {
  const [refundType, setRefundType] = useState<TSessionCancelRefundType>("smart");
  const [reason, setReason] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [preview, setPreview] = useState<ISessionCancelPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [result, setResult] = useState<ISessionCancelCommit | null>(null);

  const { mutateAsync: fetchPreview, isPending: isPreviewing } = usePreviewSessionCancel();
  const { mutateAsync: commitCancel, isPending: isCommitting } = useDeleteSession();

  const loadPreview = async (type: TSessionCancelRefundType, cancelReason: string, days: number) => {
    setPreviewError(null);
    try {
      const res = await fetchPreview({
        id: sessionId,
        default_refund_type: type,
        ...(cancelReason.trim() ? { cancel_reason: cancelReason.trim() } : null),
        ...(type !== "none" ? { refund_validity_days: Number(days) || 30 } : null),
      });
      setPreview(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setPreview(null);
      setPreviewError(err?.response?.data?.error?.message ?? "Failed to load cancel preview");
    }
  };

  useEffect(() => {
    if (open && sessionId) {
      setPreview(null);
      setPreviewError(null);
      setResult(null);
      loadPreview("smart", "", 30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId]);

  const handleClose = () => {
    setPreview(null);
    setPreviewError(null);
    setResult(null);
    setRefundType("smart");
    setReason("");
    setValidityDays(30);
    onClose();
  };

  const handleCommit = async () => {
    setPreviewError(null);
    try {
      const res = await commitCancel({
        id: sessionId,
        confirm: true,
        default_refund_type: refundType,
        ...(reason.trim() ? { cancel_reason: reason.trim() } : null),
        ...(refundType !== "none" ? { refund_validity_days: Number(validityDays) || 30 } : null),
      });
      const commit = ("mode" in res ? res : { mode: "commit", data: res.data, refunds: res.refunds }) as ISessionCancelCommit;
      setResult(commit);
      onCommitted?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setPreviewError(err?.response?.data?.error?.message ?? "Failed to cancel session");
    }
  };

  const bookings = preview?.bookings ?? [];
  const failed = result?.refunds?.results.filter((r) => r.status === "failed") ?? [];

  return (
    <BaseDialogComponent
      isOpen={open}
      title={result ? "Session Canceled" : `Cancel Session${sessionName ? `, ${sessionName}` : ""}`}
      btnConfirm={result ? "Done" : "Cancel Session"}
      onCloseText={result ? "" : "Back"}
      onClose={result ? undefined : handleClose}
      onConfirm={result ? handleClose : handleCommit}
      isDisabled={isPreviewing || isCommitting || (!result && !preview && !previewError)}
    >
      {result ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">
            {result.refunds
              ? `${result.refunds.summary.succeeded} of ${result.refunds.summary.total_bookings} bookings refunded`
              : "Session canceled without refunds."}
            {result.refunds && result.refunds.summary.auto_escalated > 0
              ? ` (${result.refunds.summary.auto_escalated} moved to new credit packages).`
              : ""}
          </p>
          {failed.length > 0 && (
            <div className="flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-700">{failed.length} refunds need attention</p>
              {failed.map((f) => (
                <p key={f.booking_id} className="text-xs text-red-600">
                  {f.booking_id}: {f.error ?? "failed"}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <RadioGroup
            value={refundType}
            onValueChange={(v) => {
              const next = v as TSessionCancelRefundType;
              setRefundType(next);
              loadPreview(next, reason, validityDays);
            }}
            className="grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-2"
          >
            <Label
              htmlFor="cancel-refund-none"
              className={cn("flex w-full cursor-pointer flex-col gap-1 rounded-xl border border-brand-400 p-3.5", {
                "border-brand-600 bg-brand-50": refundType === "none",
              })}
            >
              <div className="flex flex-col w-full gap-2">


                <span className="flex w-full gap-2">
                  <RadioGroupItem value="none" id="cancel-refund-none" />
                  <Ban className="h-4 w-4 shrink-0 text-gray-500" />
                  <span className="text-sm font-semibold text-brand-999">No refund</span>

                </span>
                <span className="pl-6 text text-xs font-normal leading-snug text-gray-500">
                  Cancel bookings without returning credits
                </span>
              </div>

            </Label>
            <Label
              htmlFor="cancel-refund-smart"
              className={cn("flex w-full cursor-pointer flex-col gap-1 rounded-xl border border-brand-400 p-3.5", {
                "border-brand-600 bg-brand-50": refundType === "smart",
              })}
            >
              <span className="flex w-full gap-2">
                <RadioGroupItem value="smart" id="cancel-refund-smart" />
                <ArrowLeftRight className="h-4 w-4 shrink-0 text-brand-600" />
                <span className="text-sm font-semibold text-brand-999">Auto refund credits</span>
              </span>
              <span className="pl-6 text-xs font-normal leading-snug text-gray-500">
                Credits return to the original package. Expired packages and non-credit payments become new 30-day credits.
              </span>
            </Label>
          </RadioGroup>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cancel-reason">Cancel reason (optional)</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Reason recorded on bookings and audit log"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[42px]"
              />
            </div>
            {refundType !== "none" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cancel-validity">New credit validity (days)</Label>
                <Input
                  id="cancel-validity"
                  type="number"
                  min={1}
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {refundType !== "none" && (
            <button
              type="button"
              onClick={() => loadPreview(refundType, reason, validityDays)}
              disabled={isPreviewing}
              className="text-left text-sm font-medium text-brand-600 underline-offset-2 hover:underline disabled:opacity-50"
            >
              {isPreviewing ? "Loading preview..." : "Refresh preview"}
            </button>
          )}

          {isPreviewing && !preview ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading booking preview...
            </div>
          ) : previewError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{previewError}</p>
          ) : refundType === "none" ? (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-amber-900">No credits will be returned</p>
                  <p className="text-sm leading-snug text-amber-800">
                    {preview?.active_bookings_count
                      ? `${preview.active_bookings_count} active booking${preview.active_bookings_count === 1 ? "" : "s"} will be canceled without any refund.`
                      : "No active bookings on this session. It will be canceled without any refund."}
                  </p>
                </div>
              </div>
              {isCommitting && (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Canceling session...
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <p className="text-sm font-semibold">
                  {preview?.active_bookings_count ?? 0} active booking{(preview?.active_bookings_count ?? 0) === 1 ? "" : "s"}{" "}
                  will be canceled
                </p>
                {bookings.length > 0 && (
                  <span className="flex flex-wrap gap-1.5">
                    {Object.entries(
                      bookings.reduce<Record<string, number>>((acc, b) => {
                        acc[b.refund_type] = (acc[b.refund_type] ?? 0) + 1;
                        return acc;
                      }, {}),
                    ).map(([type, count]) => {
                      const sample = bookings.find((b) => b.refund_type === type) as ISessionCancelPreviewBooking;
                      const meta = outcomeMeta(sample);
                      return (
                        <Badge key={type} variant="outline" className={cn("whitespace-nowrap", meta.cls)}>
                          {count} × {meta.label}
                        </Badge>
                      );
                    })}
                  </span>
                )}
              </div>
              {bookings.length === 0 ? (
                <p className="text-sm italic text-gray-500">No active bookings on this session.</p>
              ) : (
                <div className="max-h-64 overflow-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr className="text-xs uppercase tracking-wide text-gray-500">
                        <th className="px-3 py-2 font-semibold">Customer</th>
                        <th className="px-3 py-2 font-semibold">Payment</th>
                        <th className="px-3 py-2 font-semibold">Credit outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((b) => {
                        const payment = paymentMeta(b);
                        const outcome = outcomeMeta(b);
                        const detail = refundDetail(b);
                        return (
                          <tr key={b.booking_id} className="transition-colors hover:bg-gray-50">
                            <td className="px-3 py-2.5 align-top">
                              <span className="block font-medium text-gray-900">
                                {b.customer_name ?? b.user_id ?? b.booking_id}
                              </span>
                              {typeof b.credits_used === "number" && b.credits_used > 0 && (
                                <span className="block text-xs text-gray-500">
                                  {b.credits_used} credit{b.credits_used === 1 ? "" : "s"} used
                                </span>
                              )}
                              {b.escalation_reason && (
                                <span className="mt-1 flex items-start gap-1 text-xs leading-snug text-amber-700">
                                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                                  {b.escalation_reason}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 align-top">
                              <Badge variant="outline" className={cn("whitespace-nowrap capitalize", payment.cls)}>
                                {payment.label}
                              </Badge>
                              {b.payment_detail && (
                                <span className="mt-1 block max-w-44 truncate text-xs leading-snug text-gray-500" title={b.payment_detail}>
                                  {b.payment_detail}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 align-top">
                              <Badge variant="outline" className={cn("whitespace-nowrap", outcome.cls)}>
                                {outcome.label}
                              </Badge>
                              {detail && <span className="mt-1 block text-xs leading-snug text-gray-500">{detail}</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {isCommitting && (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Canceling session...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </BaseDialogComponent>
  );
};
