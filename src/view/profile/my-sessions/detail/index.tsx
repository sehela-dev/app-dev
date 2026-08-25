"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { StickyContainerComponent } from "@/components/layout";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { useRepayBooking } from "@/hooks/api/mutations/customers";
import { useGetMySessionDetail } from "@/hooks/api/queries/customer/profile";
import { formatCurrency, formatDateHelper, normalizeOrderId } from "@/lib/helper";
import { Clock, CreditCard, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

const FAILED_PAYMENT_STATUSES = ["cancel", "cancelled", "canceled", "expire", "expired", "deny", "failure"];

export const MySessionDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { data, isLoading, isFetched } = useGetMySessionDetail(id as string);
  const [open, setOpen] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const prevPendingRef = useRef<boolean | null>(null);

  const bookingData = data?.data;
  const paymentStatus = bookingData?.payment?.status;
  const normalizedBookingStatus = bookingData?.booking_status?.toLowerCase() ?? "";
  const isExpired = normalizedBookingStatus === "expired" || paymentStatus === "expire" || paymentStatus === "expired";
  const isPaymentFailed = !!paymentStatus && FAILED_PAYMENT_STATUSES.includes(paymentStatus);
  const isPendingPayment =
    !isPaymentFailed &&
    !isExpired &&
    (bookingData?.booking_status === "pending_payment" || paymentStatus === "pending");
  const isCancelled =
    normalizedBookingStatus === "cancelled" || normalizedBookingStatus === "canceled" || normalizedBookingStatus === "expired" || isExpired;
  const snapRedirectUrl = bookingData?.payment?.snap_redirect_url;
  const repayMutation = useRepayBooking();

  // Show toast when payment transitions from pending -> paid
  useEffect(() => {
    const isPaid = !isPaymentFailed && bookingData?.booking_status !== "pending_payment";
    if (prevPendingRef.current === true && isPendingPayment === false && isPaid) {
      toast.success("Payment Confirmed!", {
        id: "payment-confirmed",
        description: "Your spot is secured. See you in class!",
        position: "top-center",
      });
    }
    prevPendingRef.current = isPendingPayment;
  }, [isPendingPayment, isPaymentFailed, bookingData?.booking_status]);

  const handlePayNow = () => {
    if (snapRedirectUrl) {
      window.location.href = snapRedirectUrl;
    }
  };

  const handleRetryPayment = () => {
    if (!bookingData?.booking_id) return;
    repayMutation.mutate(bookingData.booking_id, {
      onSuccess: (res) => {
        const url = res?.data?.snap_redirect_url;
        if (url) {
          window.location.href = url;
        }
      },
    });
  };

  return (
    <>
      <div className="text-brand-500">
        <NavHeaderComponent title="My Class" />
      </div>
      <div className="flex flex-col w-full gap-[37px] min-h-screen h-full justify-between font-serif text-brand-500">
        <>
          {!isFetched && isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 px-4">
                {/* Pending Payment Banner */}
                {isExpired ? (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-zinc-300 bg-zinc-50 p-4">
                    <Clock className="h-5 w-5 shrink-0 text-zinc-600 mt-0.5" />
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="font-semibold text-sm text-zinc-800">Booking Expired</p>
                      <p className="text-xs text-zinc-700 leading-relaxed">
                        Payment window 15m after <b>{bookingData?.created_at ? formatDateHelper(bookingData.created_at, "dd MMM HH:mm") : "booking"}</b> exceeded.
                        Booking auto-set to <b>expired</b> ({bookingData?.cancel_reason ?? "payment_expired"}). Please re-book.
                      </p>
                    </div>
                  </div>
                ) : isPaymentFailed ? (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4">
                    <RefreshCw className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="font-semibold text-sm text-red-800">Payment Failed</p>
                      <p className="text-xs text-red-700 leading-relaxed">
                        Your previous payment attempt was {paymentStatus}. Tap &quot;Retry Payment&quot; below to start a
                        new payment session and secure your spot.
                      </p>
                    </div>
                  </div>
                ) : isPendingPayment ? (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
                    <Clock className="h-5 w-5 shrink-0 text-yellow-600 mt-0.5" />
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="font-semibold text-sm text-yellow-800">Payment Pending</p>
                      <p className="text-xs text-yellow-700 leading-relaxed">
                        Your booking is not confirmed yet. Complete your payment to secure your spot before the
                        reservation expires (15m after booking creation).
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-4 w-full">
                  <div className="bg-[#FFFFFFCC] border border-[#91C1CA] mx-auto w-full rounded-[12px]">
                    <div className="flex flex-col gap-4 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs">Name</p>
                          <p className="text-sm font-semibold">{bookingData?.customer_name}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs">#Order ID</p>
                          <p className="text-sm font-semibold">{normalizeOrderId(bookingData?.payment?.order_id) || "-"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs">Session</p>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold">{bookingData?.session_name}</p>
                          <p className="text-sm font-semibold">
                            {formatDateHelper?.(bookingData?.start_datetime as string, "EEEE, dd MMM yyyy")} |{" "}
                            {formatDateHelper(bookingData?.start_datetime as string, "H:mm")} -{" "}
                            {formatDateHelper(bookingData?.end_datetime as string, "H:mm")}
                          </p>
                          <p className="text-sm">{bookingData?.location_address}</p>
                        </div>
                      </div>
                      <div>
                        <Button
                          className="w-full"
                          variant={"outline"}
                          onClick={() => {
                            window.open(bookingData?.location_maps_url);
                          }}
                        >
                          <MapPin /> Open Goole Maps
                        </Button>
                      </div>
                      <div className="flex flex-col w-full bg-brand-25 p-2 gap-1">
                        {bookingData?.voucher_code ? (
                          <>
                            <div className="flex flex-row items-center justify-between">
                              <p className="font-normal text-xs text-brand-500/60">Original Price</p>
                              <p className="font-normal text-xs line-through text-brand-500/60">{formatCurrency(bookingData?.price_idr)}</p>
                            </div>
                            <div className="flex flex-row items-center justify-between">
                              <p className="font-normal text-xs text-brand-500/60">Voucher {bookingData.voucher_code}</p>
                              <p className="font-normal text-xs text-emerald-600">- {formatCurrency(bookingData?.voucher_discount_idr ?? 0)}</p>
                            </div>
                          </>
                        ) : null}
                        <div className="flex flex-row items-center justify-between">
                          <p className="font-semibold text-sm">Purchase Amount</p>
                          <p className="font-semibold text-sm">{formatCurrency(bookingData?.total_paid_idr)}</p>
                        </div>
                      </div>

                      {isPendingPayment || isPaymentFailed ? (
                        <p className="text-sm font-normal text-yellow-700">
                          *) Complete your payment to receive your entry QR code.
                        </p>
                      ) : (
                        <p className="text-sm font-normal">*) Show this QR code to the receptionist.</p>
                      )}
                    </div>
                  </div>

                  {isExpired ? (
                    <div className="mx-auto w-full flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
                      <Clock className="h-10 w-10 text-zinc-500" />
                      <p className="font-semibold text-zinc-700">Booking expired</p>
                      <p className="text-xs text-zinc-500 max-w-[240px]">
                        This booking expired 15m after creation (payment_expired). Please make a new booking.
                      </p>
                    </div>
                  ) : isPendingPayment || isPaymentFailed ? (
                    <div className="mx-auto w-full flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50/50 p-8 text-center">
                      <CreditCard className="h-10 w-10 text-yellow-600" />
                      <p className="font-semibold text-brand-500">QR code available after payment</p>
                      <p className="text-xs text-brand-500/60 max-w-[240px]">
                        {isPaymentFailed
                          ? "Tap \u201cRetry Payment\u201d below to start a new payment session via Midtrans (QRIS, e-wallet, bank transfer)."
                          : "Tap \u201cPay Now\u201d below to complete your payment via Midtrans (QRIS, e-wallet, bank transfer)."}
                      </p>
                    </div>
                  ) : (
                    <div className="mx-auto w-full flex">
                      <div
                        className="max-w-[203px] h-[203px] p-2 w-full bg-gray-50 rounded-md mx-auto"
                        onClick={() => {
                          setOpen(true);
                        }}
                      >
                        <QRCode style={{ width: "100%", height: "100%" }} value={bookingData?.booking_id as string} />
                        <div
                          className="text-center mt-4 cursor-pointer"
                          onClick={() => {
                            setOpen(true);
                          }}
                        >
                          Tap to zoom
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {open && (
                  <BaseDialogComponent isOpen={open} title="" btnConfirm="Close" onConfirm={() => setOpen(false)}>
                    <div className="p-2 w-full bg-gray-50 rounded-md mx-auto ">
                      <QRCode style={{ width: "100%", height: "100%" }} value={bookingData?.booking_id as string} />
                    </div>
                  </BaseDialogComponent>
                )}
              </div>
            </>
          )}
        </>

        <StickyContainerComponent>
          <div className="flex my-2 px-4">
            {isExpired ? (
              <Button className="w-full min-h-[48px]" variant="outline" onClick={() => router.push("/book")}>
                Browse Classes
              </Button>
            ) : isPaymentFailed ? (
              <Button
                className="w-full min-h-[48px]"
                onClick={handleRetryPayment}
                disabled={repayMutation.isPending}
              >
                {repayMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry Payment
              </Button>
            ) : isPendingPayment ? (
              <Button className="w-full min-h-[48px]" onClick={handlePayNow} disabled={!snapRedirectUrl}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            ) : (
              !isCancelled && (
                <Button
                  variant={"destructive"}
                  className="w-full bg-red-200 text-red-800"
                  onClick={() => {
                    setOpenCancel(true);
                  }}
                >
                  Cancel Class
                </Button>
              )
            )}
          </div>
        </StickyContainerComponent>
      </div>
      {openCancel && (
        <BaseDialogComponent
          isOpen={openCancel}
          title="Cancel Class?"
          btnConfirm="Cancel Class"
          onConfirm={() => alert("cancel class")}
          onClose={() => {
            setOpenCancel(false);
          }}
          onCloseText="Keep My Class"
        >
          <p className="text-center font-serif text-brand-500">Are you sure you want to cancel this booking? This action cannot be undone.</p>
        </BaseDialogComponent>
      )}
    </>
  );
};