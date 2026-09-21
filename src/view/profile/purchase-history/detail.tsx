"use client";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { useGetPaymentHistoryDetail } from "@/hooks/api/queries/customer/payments";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import {
  formatExpiryCountdown,
  getPendingPackagePayment,
  humanizePaymentStatus,
} from "@/lib/pending-package-payment";
import { AlertCircle, Gem as GemIcon, Loader2, Ticket as TicketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SUCCESS = ["settlement", "capture"];

// Payment history detail — :ref = payment uuid, readable order_id, or PKG-….
// Lifecycle fields: top-ups add purchase_status/purchased_at/expires_at,
// bookings add booking_status, both add voucher_code/discount_idr.
export const PurchaseHistoryDetailView = ({ refId }: { refId: string }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useGetPaymentHistoryDetail(refId);
  const item = data?.data;

  const kind = item?.payable_type ? String(item.payable_type) : "";
  const isPackage = kind === "package_purchase";
  const isBooking = kind === "booking";
  const status = item?.status ? String(item.status) : "";
  const serverPending = status === "pending";

  // Expiry anchor: server expires_at first, created_at + 15m fallback.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!serverPending) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [serverPending]);
  const expiresAtMs = item?.expires_at
    ? Date.parse(String(item.expires_at))
    : item?.created_at
      ? Date.parse(String(item.created_at)) + 15 * 60 * 1000
      : 0;
  const remainingMs = expiresAtMs - now;
  const timeExpired = serverPending && expiresAtMs > 0 && remainingMs <= 0;
  const displayStatus = timeExpired ? "expired" : status;
  const isPending = serverPending && !timeExpired;

  // Pending resume: row snap URL first (pending-only per BE), then stored.
  // Strict new tab — never same-tab redirect; blocked popups fall back to
  // the top-up payment page (packages) which hosts its own open button.
  const handleContinue = () => {
    if (!item) return;
    const url =
      (typeof item.snap_redirect_url === "string" && item.snap_redirect_url) ||
      (getPendingPackagePayment()?.snap_redirect_url ?? null);
    if (url && window.open(url, "_blank", "noopener,noreferrer")) return;
    if (isPackage) {
      const packageId = String(item.package_id ?? item.payable_id ?? "");
      const qs = new URLSearchParams({
        ...(item.provider_txn_id || item.order_id ? { order_id: String(item.provider_txn_id ?? item.order_id) } : {}),
        ...(url ? { snap_redirect_url: url } : {}),
        ...(item.expires_at ? { expires_at: String(item.expires_at) } : {}),
        ...(item.created_at ? { created_at: String(item.created_at) } : {}),
      });
      router.push(packageId ? `/topup-credit/${packageId}/payment?${qs.toString()}` : "/profile/purchase-history");
    } else if (isBooking && item.payable_id) {
      router.push(`/profile/my-sessions/${String(item.payable_id)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <NavHeaderComponent title="Payment Detail" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="flex flex-col w-full font-serif h-full text-brand-500">
        <NavHeaderComponent title="Payment Detail" />
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="font-semibold text-lg">Payment not found</p>
          <p className="max-w-[280px] text-sm text-brand-500/70">This payment doesn&apos;t exist or isn&apos;t yours.</p>
          <Button className="mt-2 min-h-12 text-sm font-extrabold" onClick={() => router.push("/profile/purchase-history")}>
            Back to history
          </Button>
        </div>
      </div>
    );
  }

  const amount = item.gross_amount_idr ?? (item.amount_idr as number | undefined) ?? 0;
  const title = isPackage
    ? String(item.package_name ?? "Credit package")
    : isBooking
      ? String(item.session_name ?? "Class booking")
      : "Payment";
  const lifecycle = item.purchase_status ?? item.booking_status;
  const discount = item.discount_idr != null ? Number(item.discount_idr) : 0;

  return (
    <div className="flex flex-col w-full font-serif h-full text-brand-500">
      <NavHeaderComponent title="Payment Detail" />
      <div className="flex flex-col gap-3 px-4 mt-4 pb-6">
        <div className="rounded-2xl border border-brand-100 bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <span
              className={
                isPackage
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500"
                  : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600"
              }
            >
              {isPackage ? <GemIcon size={16} className="text-white" /> : <TicketIcon size={16} className="text-white" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-900">{title}</p>
              <p className="text-[11px] text-gray-500">{humanizePaymentStatus(displayStatus)}</p>
            </div>
            <p className="shrink-0 text-base font-bold text-brand-900">{formatCurrency(String(amount))}</p>
          </div>
          {isPending && expiresAtMs > 0 && (
            <p className="mt-2 font-mono text-[11px] font-bold text-red-600">Expires in {formatExpiryCountdown(remainingMs)}</p>
          )}

          <div className="mt-2 space-y-2 border-t border-brand-50 pt-2 text-sm">
            {lifecycle && (
              <Row label={isPackage ? "Purchase" : "Booking"} value={String(lifecycle)} capitalize />
            )}
            {isPackage && item.package_credits != null && (
              <Row label="Credits" value={`${String(item.package_credits)} credits`} />
            )}
            {isBooking && item.class_name && <Row label="Class" value={String(item.class_name)} />}
            {item.purchased_at && (
              <Row label="Purchased" value={formatDateHelper(String(item.purchased_at), "dd MMM yyyy · HH:mm")} />
            )}
            {item.expires_at && (
              <Row label="Pay before" value={formatDateHelper(String(item.expires_at), "dd MMM yyyy · HH:mm")} />
            )}
            {item.voucher_code && <Row label="Voucher" value={String(item.voucher_code)} mono />}
            {discount > 0 && <Row label="Discount" value={`− ${formatCurrency(String(discount))}`} />}
            {item.order_id && <Row label="Order ID" value={String(item.order_id)} mono />}
            {item.provider_txn_id && <Row label="Transaction ID" value={String(item.provider_txn_id)} mono />}
            {item.created_at && (
              <Row label="Created" value={formatDateHelper(String(item.created_at), "dd MMM yyyy · HH:mm")} />
            )}
          </div>
        </div>

        {isPending && (
          <Button className="min-h-12 w-full text-sm font-extrabold" onClick={handleContinue}>
            Continue payment
          </Button>
        )}
        {!isPending && (SUCCESS.includes(status)) && (
          <Button
            className="min-h-12 w-full text-sm font-extrabold"
            onClick={() => router.push(isBooking ? "/profile/my-sessions" : "/profile/my-credits")}
          >
            {isBooking ? "View My Class" : "View My Credits"}
          </Button>
        )}
        <div className="text-center">
          <Button variant="link" className="text-xs" onClick={() => router.push("/profile/purchase-history")}>
            Back to history
          </Button>
        </div>
      </div>
    </div>
  );
};

function Row({ label, value, mono, capitalize }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-[13px] text-gray-500">{label}</span>
      <span className={`truncate text-right text-[13px] font-medium text-brand-900 ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </span>
    </div>
  );
}

