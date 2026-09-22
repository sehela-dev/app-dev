"use client";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthMember } from "@/context/member.ctx";
import { useInitiatePackagePurchase } from "@/hooks/api/mutations/customers";
import { useGetPublicCreditPackageDetail } from "@/hooks/api/queries/customer/public";
import { useGetPaymentStatus } from "@/hooks/api/queries/customer/payments";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import {
  PACKAGE_PAYMENT_FAILURE_STATUSES,
  PACKAGE_PAYMENT_SUCCESS_STATUSES,
  clearPendingPackagePayment,
  formatExpiryCountdown,
  getPaymentExpiryRemainingMs,
  getPendingPackagePayment,
  humanizePaymentStatus,
  openSnapInNewTab,
  setPendingPackagePayment,
} from "@/lib/pending-package-payment";
import { CalendarClock, GemIcon, Info, Loader2, MapPin, RefreshCw, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const TopUpCreditDetailView = ({ id }: { id: string }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthMember();
  const { data, isLoading, isError } = useGetPublicCreditPackageDetail(id);
  const { mutateAsync, isPending } = useInitiatePackagePurchase();
  // Restore an in-progress payment (e.g. user returns from the Snap tab or refreshes)
  const [pending, setPending] = useState<{ orderId: string; snapUrl: string; initiatedAt: number } | null>(() => {
    const stored = getPendingPackagePayment();
    if (!stored || stored.package_id !== id) return null;
    // Backfill old records saved without a timestamp so they don't instantly read as expired
    const initiatedAt = stored.initiated_at || Date.now();
    return { orderId: stored.order_id, snapUrl: stored.snap_redirect_url, initiatedAt };
  });

  // Polls payment status every 3s until terminal (settlement/capture or deny/cancel/expire/…)
  const { data: statusData, refetch: refetchStatus } = useGetPaymentStatus(pending?.orderId ?? null);
  const serverStatus = statusData?.data?.transaction_status ?? "";
  const isSettled = PACKAGE_PAYMENT_SUCCESS_STATUSES.includes(serverStatus);
  const isFailed = PACKAGE_PAYMENT_FAILURE_STATUSES.includes(serverStatus);

  // 15-min Midtrans window countdown — ticks while a payment is in flight
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!pending || isSettled || isFailed) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [pending, isSettled, isFailed]);
  const remainingMs = pending ? getPaymentExpiryRemainingMs(pending.initiatedAt, now) : 0;
  const isExpired = !!pending && !isSettled && !isFailed && remainingMs <= 0;
  const isTerminal = isSettled || isFailed || isExpired;

  useEffect(() => {
    if (isTerminal) clearPendingPackagePayment();
  }, [isTerminal]);

  const item = data?.data;

  const handleBuy = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?next=${encodeURIComponent(`/topup-credit/${id}`)}`);
      return;
    }
    // Resume the stored Snap URL in a NEW TAB only — never same-tab redirect.
    // Never re-initiate while a payment is in flight (each call = new payment row).
    if (pending && !isTerminal) {
      handleContinue();
      return;
    }
    if (isPending) return;
    try {
      const res = await mutateAsync({ package_id: id });
      const url = res.data?.snap_redirect_url;
      const orderId = res.data?.order_id;
      if (!url || !orderId) return;
      const initiatedAt = Date.now();
      setPendingPackagePayment({ order_id: orderId, package_id: id, snap_redirect_url: url, initiated_at: initiatedAt });
      setPending({ orderId, snapUrl: url, initiatedAt });
      setNow(initiatedAt);
      // Same as drop-in booking: open Midtrans in a new tab, land on the payment (pending) page
      // openSnapInNewTab(url);
      const qs = new URLSearchParams({ order_id: orderId, snap_redirect_url: url });
      router.push(`/topup-credit/${id}/payment?${qs.toString()}`);
    } catch {
      // toast handled in mutation; user can retry with the same button
    }
  };

  const handleRetry = () => {
    setPending(null);
    clearPendingPackagePayment();
  };

  // Continue payment: reuse one named Snap tab so repeat taps focus it
  // instead of stacking duplicate payment tabs. When the popup is blocked we
  // do NOT redirect this page to Snap — instead we land on the payment
  // (pending) page, whose "Open Midtrans" button is a fresh user gesture.
  const handleContinue = () => {
    if (!pending) return;
    const tab = window.open(pending.snapUrl, "sehela-snap-payment");
    if (tab) {
      tab.opener = null;
      tab.focus();
      return;
    }
    const qs = new URLSearchParams({ order_id: pending.orderId, snap_redirect_url: pending.snapUrl });
    router.push(`/topup-credit/${id}/payment?${qs.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <NavHeaderComponent title="Package Detail" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // A2: hidden/inactive package → 404 NOT_FOUND → "not available" page (direct-link case)
  if (isError || !item) {
    return (
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <NavHeaderComponent title="Package Detail" />
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <p className="text-xl font-extrabold">Package not available</p>
          <p className="max-w-[280px] text-sm text-brand-500/70">
            This credit package doesn&apos;t exist or is no longer available.
          </p>
          <Button className="mt-2 min-h-12 text-sm font-extrabold" onClick={() => router.push("/topup-credit")}>
            Browse packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full font-serif h-full text-brand-500">
      <NavHeaderComponent title={item.name} />

      <div className="flex flex-col gap-4 px-4 mt-4 pb-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500">
              <GemIcon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-brand-900">{item.credits} Credits</p>
              <p className="text-xs text-gray-500">{item.name}</p>
            </div>
          </div>
          {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Ticket size={12} className="text-brand-400" /> {item.validity_days} days validity
            </span>
            <span className="h-3 w-px bg-gray-200" />
            <span className="inline-flex items-center gap-1.5 capitalize">
              <MapPin size={12} className="text-brand-400" />
              {item.place_restriction ?? "Offline & Online"}
            </span>
            {item.session_type_restriction && (
              <>
                <span className="h-3 w-px bg-gray-200" />
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                  {item.session_type_restriction}
                </Badge>
              </>
            )}
          </div>
          {item.class_ids_restriction?.length > 0 && (
            <p className="text-xs text-gray-600">
              Valid for: {item.class_ids_restriction.map((c) => c.name).join(", ")}
            </p>
          )}
          <div className="flex gap-2.5 rounded-xl border border-brand-100 bg-brand-25 px-3.5 py-3">
            <Info size={15} className="mt-0.5 shrink-0 text-brand-500" />
            <p className="text-[11px] leading-relaxed text-brand-900">
              The {item.validity_days}-day validity starts on <span className="font-semibold">first use</span> —
              counted from your first class with this package, not from purchase.
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
            <CalendarClock size={11} /> Updated {formatDateHelper(item.updated_at, "dd MMM yyyy")}
          </p>
          <div className="flex items-center justify-between border-t border-brand-50 pt-3">
            <p className="text-xl font-bold text-brand-900">{formatCurrency(String(item.price_idr))}</p>
            {item.is_shareable && (
              <Badge variant="outline" className="rounded-full text-[10px]">
                Shareable
              </Badge>
            )}
          </div>
        </div>

        <Button
          className="min-h-12 w-full text-sm font-extrabold"
          onClick={isFailed || isExpired ? handleRetry : pending && !isTerminal ? handleContinue : handleBuy}
          disabled={isPending}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Opening payment…
            </span>
          ) : isFailed || isExpired ? (
            "Try again"
          ) : pending && !isTerminal ? (
            "Continue payment"
          ) : isAuthenticated ? (
            "Buy now"
          ) : (
            "Login to buy"
          )}
        </Button>
        {/* Pending-payment state, like the booking class detail page */}
        {pending && !isTerminal && (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-yellow-600" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-yellow-800">Payment Pending</p>
                <p className="font-mono text-sm font-bold text-yellow-800">{formatExpiryCountdown(remainingMs)}</p>
              </div>
              <p className="text-xs leading-relaxed text-yellow-700">
                Payment opened in a new tab — complete it within 15 minutes. This page checks the status
                automatically{serverStatus ? ` (now: ${humanizePaymentStatus(serverStatus)})` : ""}.
              </p>
              <button
                type="button"
                className="self-start text-xs font-semibold text-yellow-800 underline"
                onClick={() => refetchStatus()}
              >
                Refresh status
              </button>
            </div>
          </div>
        )}
        {pending && isSettled && (
          <div className="flex items-start gap-3 rounded-xl border border-green-300 bg-green-50 p-4">
            <GemIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm font-semibold text-green-800">Payment Success</p>
              <p className="text-xs leading-relaxed text-green-700">
                Your credits are on the way — check My Credits for the updated balance.
              </p>
              <Button
                className="min-h-10 w-full text-xs font-extrabold"
                onClick={() => router.push("/profile/my-credits")}
              >
                View My Credits
              </Button>
            </div>
          </div>
        )}
        {pending && (isFailed || isExpired) && (
          <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4">
            <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm font-semibold text-red-800">
                {isExpired ? "Payment Expired" : `Payment ${humanizePaymentStatus(serverStatus)}`}
              </p>
              <p className="text-xs leading-relaxed text-red-700">
                {isExpired
                  ? "The 15-minute payment window has passed. Tap “Try again” to start a new payment."
                  : "Your previous attempt didn’t go through. Tap “Try again” to start a new payment."}
              </p>
            </div>
          </div>
        )}
        <p className="text-center text-[11px] text-gray-500">
          Payment opens in a new tab — credits appear under My Credits once the payment settles.
        </p>
        <div className="text-center">
          <Button variant="link" className="text-xs" onClick={() => router.push("/profile/purchase-history")}>
            View purchase history
          </Button>
        </div>
      </div>
    </div>
  );
};
