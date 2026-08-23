"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, QrCode, Clock, CheckCircle, AlertCircle, CreditCard, Home, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useGetMySessionDetail } from "@/hooks/api/queries/customer/profile";
import { formatDateHelper } from "@/lib/helper";

const PAYMENT_TIMEOUT_MS = 2 * 60 * 1000;

export default function CashPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const sessionId = typeof id === "string" ? id : undefined;
  const bookingId = searchParams.get("booking_id") as string | null;
  const snapParam = searchParams.get("snap_redirect_url") as string | null;

  const [timeRemaining, setTimeRemaining] = useState(PAYMENT_TIMEOUT_MS);
  const [isExpired, setIsExpired] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const hasOpenedRef = useRef(false);

  // Use profile/my-sessions/:id (booking_id) - requested API, not public/sessions or public/bookings
  const { data: detailResp, isLoading, isError, refetch } = useGetMySessionDetail(bookingId ?? undefined);
  const detail = detailResp?.data;

  // snap_redirect_url from profile detail, URL param takes priority for popup-block fallback
  const snapUrl = snapParam || detail?.payment?.snap_redirect_url || null;

  const bookingStatus = detail?.booking_status ?? null;
  const paymentStatus = detail?.payment?.status ?? null;
  const orderId = detail?.payment?.order_id ?? null;

  // Open Midtrans in new tab once — keeps this page as success host
  useEffect(() => {
    if (!snapUrl || hasOpenedRef.current || paymentConfirmed) return;
    hasOpenedRef.current = true;
    const w = window.open(snapUrl, "_blank", "noopener,noreferrer");
    if (!w) hasOpenedRef.current = false;
  }, [snapUrl, paymentConfirmed]);

  useEffect(() => {
    if (paymentConfirmed) return;
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
  }, [paymentConfirmed]);

  useEffect(() => {
    if (bookingStatus === "confirmed" || paymentStatus === "paid" || paymentStatus === "settlement" || paymentStatus === "capture") {
      setPaymentConfirmed(true);
    }
  }, [bookingStatus, paymentStatus]);

  useEffect(() => {
    if (isExpired && !paymentConfirmed) refetch();
  }, [isExpired, paymentConfirmed, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (isError || (!detail && !snapParam)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-4 font-serif text-brand-500">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="font-semibold text-lg">Unable to load payment details</p>
        <p className="text-sm text-brand-500/70">Please try again or contact support</p>
        <Button variant="outline" onClick={() => router.push("/book")} className="mt-2 rounded-xl border-brand-200">
          Back to Booking
        </Button>
      </div>
    );
  }

  const className = detail?.session_name || detail?.class_name || "Class";
  const startDatetime = detail?.start_datetime || "";
  const amountIdr = detail?.total_paid_idr ?? detail?.price_idr ?? 0;
  const qrisUrl: string | null = null;
  const instructions: string | null = null;
  const isPending = bookingStatus === "pending_payment" || paymentStatus === "pending";

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (paymentConfirmed) {
    return (
      <div className="flex flex-col min-h-dvh bg-gray-50 font-serif">
        <div className="flex w-full max-w-md mx-auto px-4 py-8 flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl" />
              <div className="relative rounded-full bg-brand-500 p-4 shadow-sm">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-extrabold text-2xl text-brand-700">Payment Success</h1>
              <p className="text-sm text-brand-500/70 max-w-[320px] leading-relaxed">
                You&apos;re all set! Your spot at Sehela Space is confirmed.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-brand-50 p-2">
                <CreditCard className="h-4 w-4 text-brand-600" />
              </div>
              <h3 className="font-semibold text-brand-700">Booking Details</h3>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Confirmed
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="text-brand-500/60 shrink-0">Class</span>
                <span className="font-medium text-brand-900 text-right">{className}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-brand-500/60 shrink-0">Date & Time</span>
                <span className="font-medium text-brand-900 text-right">
                  {startDatetime ? formatDateHelper(startDatetime, "EEEE, dd MMM yyyy HH:mm") : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-brand-500/60">Amount</span>
                <span className="font-bold text-brand-700">Rp {Number(amountIdr).toLocaleString("id-ID")}</span>
              </div>
              <div className="h-px bg-brand-50" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-brand-500/60">Order ID</span>
                <span className="font-mono text-xs text-brand-700">{orderId ?? "—"}</span>
              </div>
              {bookingId && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-brand-500/60 text-xs">Booking ID</span>
                  <span className="font-mono text-xs text-brand-500 truncate max-w-[160px]">{bookingId}</span>
                </div>
              )}
            </div>
            <div className="mt-4 rounded-xl bg-brand-25 border border-brand-100 p-3 text-center">
              <p className="text-xs font-medium text-brand-700">✓ Keep this page for check-in</p>
              <p className="text-xs text-brand-500/70 mt-0.5">QR will be available in My Class. Arrive 15 minutes early.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="min-h-12 w-full rounded-xl bg-brand-500 text-sm font-bold text-white hover:bg-brand-600 shadow-sm"
              onClick={() => router.push("/profile/my-sessions")}
            >
              View My Class
            </Button>
            <Button
              variant="outline"
              className="min-h-12 w-full rounded-xl border-brand-200 text-brand-600 hover:bg-brand-25 font-semibold"
              onClick={() => router.push("/book")}
            >
              Back to Booking
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50 font-serif">
      <div className="flex w-full max-w-md mx-auto px-4 py-8 flex-col gap-6">
        <div className="text-center">
          <h1 className="font-bold text-2xl text-brand-500">Complete Your Payment</h1>
          <p className="text-brand-500/60 mt-1">Pay via Midtrans in new tab — we&apos;ll confirm here</p>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-100 p-3">
                <QrCode className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <p className="font-semibold text-brand-500">Midtrans Payment</p>
                <p className="text-xs text-brand-500/60">Opened in new tab</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="font-mono font-bold text-red-600">{formatTime(timeRemaining)}</span>
              <span className="text-xs text-red-500">remaining</span>
            </div>
          </div>

          {snapUrl ? (
            <div className="rounded-xl border border-brand-200 bg-brand-25 p-4 mb-6">
              <p className="text-sm font-medium text-brand-700">Payment page opened in new tab</p>
              <p className="text-xs text-brand-500/70 mt-1">If it didn&apos;t open, click below. Keep this page open — we&apos;ll auto-detect success.</p>
              <Button className="mt-3 w-full rounded-xl bg-brand-500 text-white hover:bg-brand-600" onClick={() => window.open(snapUrl, "_blank", "noopener,noreferrer")}>
                <ExternalLink className="h-4 w-4" />
                Open Midtrans Payment Page
              </Button>
            </div>
          ) : qrisUrl ? (
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative rounded-xl border border-brand-100 bg-white p-4">
                <img src={qrisUrl} alt="QRIS Payment" className="h-64 w-64 object-contain" />
              </div>
              <p className="text-sm text-brand-500/70 text-center">Scan with your e-wallet app (GoPay, OVO, DANA, ShopeePay, etc.)</p>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-brand-200 bg-brand-25 p-8 text-center mb-6">
              <CreditCard className="h-12 w-12 mx-auto text-brand-500/50 mb-3" />
              <p className="font-medium text-brand-500">Payment Instructions</p>
              <p className="text-sm text-brand-500/60 mt-1">{instructions ?? "Payment details will be shown here. Please complete payment at the studio."}</p>
            </div>
          )}

          <div className="rounded-xl border border-brand-100 bg-brand-25 p-4 mb-6">
            <h3 className="font-semibold text-brand-500 mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-500/60">Class</span>
                <span className="font-medium">{className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500/60">Date & Time</span>
                <span className="font-medium">{startDatetime ? formatDateHelper(startDatetime, "EEEE, dd MMM yyyy HH:mm") : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-500/60">Amount</span>
                <span className="font-bold text-lg text-brand-500">Rp {Number(amountIdr).toLocaleString("id-ID")}</span>
              </div>
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-brand-500/60">Order ID</span>
                  <span className="font-mono text-xs">{orderId}</span>
                </div>
              )}
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
              <p className="text-sm font-medium text-yellow-700">Payment time expired. Your booking is still pending. You can pay at the studio before class starts.</p>
            </div>
          )}

          <div className="space-y-3">
            <Button variant="outline" onClick={() => refetch()} className="w-full rounded-xl border-brand-200 py-3 text-brand-600 font-semibold hover:bg-brand-25">
              I&apos;ve Completed Payment — Check Status
            </Button>
            {snapUrl && (
              <button
                onClick={() => window.open(snapUrl, "_blank", "noopener,noreferrer")}
                className="w-full rounded-xl border border-brand-500 bg-white py-3 text-brand-500 font-semibold transition-colors hover:bg-brand-25 flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Re-open Payment Page
              </button>
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
          <p className="text-xs text-brand-500/50">Cash and QRIS accepted at front desk. Please arrive 15 minutes early.</p>
        </div>
      </div>
    </div>
  );
}
