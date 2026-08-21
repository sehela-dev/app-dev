"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, QrCode, Clock, CheckCircle, AlertCircle, CreditCard, Home, ExternalLink } from "lucide-react";

import { useGetPublicBookingDetail } from "@/hooks/api/queries/customer/public";
import { formatDateHelper } from "@/lib/helper";

const PAYMENT_TIMEOUT_MS = 2 * 60 * 1000;

export default function CashPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const bookingId = searchParams.get("booking_id") as string;
  const snapRedirectUrl = searchParams.get("snap_redirect_url") as string | null;
  const [timeRemaining, setTimeRemaining] = useState(PAYMENT_TIMEOUT_MS);
  const [isExpired, setIsExpired] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [showMidtransRedirect, setShowMidtransRedirect] = useState(false);

  const { data: booking, isLoading, isError, refetch } = useGetPublicBookingDetail(
    bookingId,
    !!bookingId && !paymentConfirmed && !isExpired && !showMidtransRedirect
  );

  // If we have a snap_redirect_url from URL params, redirect to Midtrans immediately
  useEffect(() => {
    if (snapRedirectUrl && !showMidtransRedirect) {
      setShowMidtransRedirect(true);
      window.location.href = snapRedirectUrl;
    }
  }, [snapRedirectUrl, showMidtransRedirect]);

  // Also check booking data for snap_redirect_url (for polling scenario)
  useEffect(() => {
    if (booking?.data?.snap_redirect_url && !showMidtransRedirect && !paymentConfirmed) {
      setShowMidtransRedirect(true);
      window.location.href = booking.data.snap_redirect_url;
    }
  }, [booking?.data?.snap_redirect_url, showMidtransRedirect, paymentConfirmed]);

  useEffect(() => {
    if (!bookingId) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          setIsExpired(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    if (booking?.data?.booking_status === "confirmed" || booking?.data?.payment_status === "paid") {
      setPaymentConfirmed(true);
      router.push(`/checkout/${id}/success?booking_id=${bookingId}`);
    }
  }, [booking?.data?.booking_status, booking?.data?.payment_status, router, id, bookingId]);

  useEffect(() => {
    if (isExpired && !paymentConfirmed) {
      refetch();
    }
  }, [isExpired, paymentConfirmed, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (isError || !booking?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-4 font-serif text-brand-500">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="font-semibold text-lg">Unable to load payment details</p>
        <p className="text-sm text-brand-500/70">Please try again or contact support</p>
      </div>
    );
  }

  if (showMidtransRedirect) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="font-semibold text-brand-500">Redirecting to payment gateway...</p>
          <p className="text-sm text-brand-500/60 mt-2">If not redirected, click below</p>
          <a
            href={snapRedirectUrl || booking?.data?.snap_redirect_url || "#"}
            className="mt-4 inline-flex items-center gap-2 text-brand-500 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Open Payment Page
          </a>
        </div>
      </div>
    );
  }

  const bookingData = booking.data;
  const isPending = bookingData.booking_status === "pending_payment" || bookingData.payment_status === "pending";

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50 font-serif">
      <div className="flex w-full max-w-md mx-auto px-4 py-8 flex-col gap-6">
        <div className="text-center">
          <h1 className="font-bold text-2xl text-brand-500">Complete Your Payment</h1>
          <p className="text-brand-500/60 mt-1">Scan QRIS or pay at studio</p>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-100 p-3">
                <QrCode className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <p className="font-semibold text-brand-500">QRIS Payment</p>
                <p className="text-xs text-brand-500/60">Scan to pay instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="font-mono font-bold text-red-600">{formatTime(timeRemaining)}</span>
              <span className="text-xs text-red-500">remaining</span>
            </div>
          </div>

          {bookingData.qris_image_url && (
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative rounded-xl border border-brand-100 bg-white p-4">
                <img
                  src={bookingData.qris_image_url}
                  alt="QRIS Payment"
                  className="h-64 w-64 object-contain"
                />
              </div>
              <p className="text-sm text-brand-500/70 text-center">
                Scan with your e-wallet app (GoPay, OVO, DANA, ShopeePay, etc.)
              </p>
            </div>
          )}

          {!bookingData.qris_image_url && (
            <div className="rounded-xl border-2 border-dashed border-brand-200 bg-brand-25 p-8 text-center mb-6">
              <CreditCard className="h-12 w-12 mx-auto text-brand-500/50 mb-3" />
              <p className="font-medium text-brand-500">Payment Instructions</p>
              <p className="text-sm text-brand-500/60 mt-1">
                {bookingData.payment_instructions ?? "Payment details will be shown here. Please complete payment at the studio."}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-brand-100 bg-brand-25 p-4 mb-6">
            <h3 className="font-semibold text-brand-500 mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-500/60">Class</span>
                <span className="font-medium">{bookingData.class_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500/60">Date & Time</span>
                <span className="font-medium">
                  {formatDateHelper(bookingData.start_datetime, "EEEE, dd MMM yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500/60">Amount</span>
                <span className="font-bold text-lg text-brand-500">
                  Rp {bookingData.amount_idr.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500/60">Order ID</span>
                <span className="font-mono text-xs">{bookingData.order_id}</span>
              </div>
            </div>
          </div>

          {isPending && !isExpired && (
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4 mb-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-blue-700">Waiting for payment confirmation...</p>
            </div>
          )}

          {isExpired && !paymentConfirmed && (
            <div className="flex items-center gap-2 rounded-xl bg-yellow-50 border border-yellow-100 p-4 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm font-medium text-yellow-700">
                Payment time expired. Your booking is still pending. You can pay at the studio before class starts.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => refetch()}
              disabled={paymentConfirmed || isExpired}
              className="w-full rounded-xl border border-brand-500 bg-brand-500 py-3 text-gray-50 font-semibold transition-colors hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentConfirmed ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 inline" />
                  Payment Confirmed - Redirecting...
                </>
              ) : isExpired ? (
                "Check Payment Status"
              ) : (
                "I've Completed Payment - Check Status"
              )}
            </button>

            {bookingData.snap_redirect_url && (
              <a
                href={bookingData.snap_redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-xl border border-brand-500 bg-white py-3 text-brand-500 font-semibold transition-colors hover:bg-brand-25 flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Midtrans Payment Page
              </a>
            )}

            <button
              onClick={() => router.push(`/book`)}
              className="w-full rounded-xl border border-brand-100 bg-white py-3 text-brand-500 font-semibold transition-colors hover:bg-brand-25"
            >
              Back to Booking
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-brand-100 bg-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-brand-500/60 mb-2">
            <Home className="h-4 w-4" />
            <span>Or pay directly at the studio before class</span>
          </div>
          <p className="text-xs text-brand-500/50">
            Cash and QRIS accepted at front desk. Please arrive 15 minutes early.
          </p>
        </div>
      </div>
    </div>
  );
}