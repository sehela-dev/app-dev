"use client";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { CalendarClock, GemIcon, Info, Loader2, RefreshCw, Ticket, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { getShareErrorMessage } from "@/api-req/customer-app/payments";

export const TopUpCreditDetailView = ({ id }: { id: string }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthMember();
  const { data, isLoading, isError } = useGetPublicCreditPackageDetail(id);
  const { mutateAsync, isPending } = useInitiatePackagePurchase();
  const [agreed, setAgreed] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareError, setShareError] = useState<string | null>(null);
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
  const credits = Number(item?.credits) || 0;
  const price = Number(item?.price_idr) || 0;
  const perClass = credits > 0 ? formatCurrency(String(Math.round(price / credits))) : null;
  const place = (item?.place_restriction ?? "").toLowerCase();
  const placeLabel = place === "offline" ? "in studio" : place === "online" ? "online" : "in studio & online";
  const classNames = item?.class_ids_restriction?.map((c) => c.name).join(", ");
  const classLabel = classNames ? classNames : "All Classes";

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
    const trimmedEmail = shareEmail.trim();
    if (trimmedEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setShareError("Enter a valid email address.");
        return;
      }
    }
    setShareError(null);
    try {
      const res = await mutateAsync({ package_id: id, ...(trimmedEmail ? { share_with_email: trimmedEmail } : {}) });
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
    } catch (err) {
      const code = (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response?.data
        ?.error?.code;
      const serverMessage = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
        ?.message;
      if (code === "SHARED_USER_NOT_FOUND" || code === "VALIDATION_ERROR" || code?.startsWith("SHARE")) {
        setShareError(getShareErrorMessage(code, serverMessage));
      }
      // other errors toast via the mutation; user can retry with the same button
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
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-25">
              <GemIcon size={14} className="text-brand-500" />
            </span>
            <p className="truncate text-sm font-semibold text-brand-900">{item.name}</p>
          </div>
          <p className="block text-4xl font-bold leading-none tracking-tight text-brand-900">
            {item.credits} <span className="text-[11px] font-medium tracking-widest text-brand-500">CREDITS</span>
          </p>
          {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
          <div className="flex flex-col gap-1 text-[11px] leading-relaxed text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Ticket size={12} className="shrink-0 text-brand-400" />
              <span>
                Use within <span className="font-bold text-brand-900">{item.validity_days} days</span> of your first
                class
              </span>
            </span>
            <span className="capitalize">
              {classLabel} · {placeLabel}
              {item.session_type_restriction ? ` · ${item.session_type_restriction}` : ""}
            </span>
          </div>
          <div className="flex gap-2.5 rounded-xl border border-brand-100 bg-brand-25 px-3.5 py-3">
            <Info size={15} className="mt-0.5 shrink-0 text-brand-500" />
            <p className="text-[11px] leading-relaxed text-brand-900">
              The {item.validity_days}-day validity starts on <span className="font-semibold">first use</span>,
              counted from your first class with this package, not from purchase.
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
            <CalendarClock size={11} /> Updated {formatDateHelper(item.updated_at, "dd MMM yyyy")}
          </p>
          <div className="flex items-end justify-between gap-3 border-t border-brand-50 pt-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-xl font-bold tracking-tight text-brand-900">
                {formatCurrency(String(item.price_idr))}
              </p>
              {perClass && <p className="text-[11px] text-gray-500">{perClass} per class</p>}
            </div>
            {item.is_shareable && (
              <Badge variant="outline" className="rounded-full text-[10px]">
                Shareable
              </Badge>
            )}
          </div>
        </div>

        {item.is_shareable && (
          <div className="flex flex-col gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-3.5">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900">
              <Users size={13} className="text-brand-500" /> Share with a friend (optional)
            </p>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Add their registered email now. You can also share later from My Credits, before the first class is used.
            </p>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="friend@mail.com"
              value={shareEmail}
              onChange={(e) => {
                setShareEmail(e.target.value);
                if (shareError) setShareError(null);
              }}
              aria-label="Friend email to share this package with"
              aria-invalid={!!shareError}
              className="min-h-11 rounded-xl border-brand-100"
            />
            {shareError ? (
              <p role="alert" className="text-[11px] font-medium text-red-600">{shareError}</p>
            ) : (
              <p className="text-[11px] text-gray-400">They must already have a Sehela account. Sharing lasts until the package expires and cannot be revoked.</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5 rounded-2xl border border-brand-100 bg-white px-4 py-3.5">
          <p className="text-xs font-semibold text-brand-900">This package</p>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-[11px] leading-relaxed text-gray-500">
            <li>
              Activate within {item.validity_days} {item.validity_days === 1 ? "day" : "days"} of purchase by joining
              your first class. You then have {item.validity_days} {item.validity_days === 1 ? "day" : "days"} to use
              all {credits} {credits === 1 ? "credit" : "credits"}.
            </li>
            <li>
              Your expiry date appears in My Credits the day after your first class. Please check it there and keep an
              eye on it.
            </li>
            <li>
              {item.is_shareable ? "Can be shared with 1 friend before first use." : "For 1 person only."}
              {item.max_purchases_per_user === 1 ? " First-timers only, one purchase per person." : null}
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-1.5 rounded-2xl border border-brand-100 bg-white px-4 py-3.5">
          <p className="text-xs font-semibold text-brand-900">Purchase terms</p>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-[11px] leading-relaxed text-gray-500">
            <li>All bookings and purchases must be paid in full at the time of booking or purchase and are non-refundable.</li>
            <li>
              If you cancel your class booking more than 6 hours before the scheduled class, the amount paid may be
              converted into Sehela Space credit for future bookings.
            </li>
            <li>Cancellations within 6 hours before the scheduled class and no-shows receive no refund or credit.</li>
            <li>
              Sehela Space credit is not redeemable for cash and may only be used for eligible future bookings at Sehela
              Space.
            </li>
          </ul>
          <button
            type="button"
            className="mt-1 self-start text-[11px] font-semibold text-brand-700 underline underline-offset-2"
            onClick={() => router.push("/terms-and-conditions")}
          >
            Read full terms and conditions
          </button>
        </div>

        <label
          htmlFor="agree-tnc"
          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-brand-100 bg-brand-25 px-3.5 py-3"
        >
          <Checkbox
            id="agree-tnc"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            aria-required="true"
            className="mt-0.5 size-5"
          />
          <span className="text-xs leading-relaxed text-brand-900">
            I have read and agree to the purchase terms above, including full payment at purchase and the
            non-refundable policy.
          </span>
        </label>

        <Button
          className="min-h-12 w-full text-sm font-extrabold"
          onClick={isFailed || isExpired ? handleRetry : pending && !isTerminal ? handleContinue : handleBuy}
          disabled={isPending || !agreed}
          aria-describedby={!agreed ? "tnc-hint" : undefined}
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
        {!agreed && !(pending && isSettled) && (
          <p id="tnc-hint" className="text-center text-[11px] text-gray-500">
            Please read and agree to the purchase terms above to continue
            {!isAuthenticated ? " to login and buy" : ""}.
          </p>
        )}
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
