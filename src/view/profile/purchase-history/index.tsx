"use client";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { CustomPagination } from "@/components/general/pagination-component";
import { useGetPaymentHistory } from "@/hooks/api/queries/customer/payments";
import type { IPackagePaymentHistoryItem } from "@/api-req/customer-app/payments";
import { formatCurrency, formatDateHelper } from "@/lib/helper";
import { formatExpiryCountdown, humanizePaymentStatus } from "@/lib/pending-package-payment";
import { Gem as GemIcon, ChevronRight, Loader2, ReceiptText, Ticket as TicketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SUCCESS = ["settlement", "capture"];
const FAILED = ["deny", "cancel", "expire", "failure", "refund", "chargeback"];

function statusDot(status?: string) {
  if (!status) return "bg-gray-300";
  if (SUCCESS.includes(status)) return "bg-green-500";
  if (FAILED.includes(status)) return "bg-red-500";
  return "bg-amber-500";
}

function statusText(status?: string) {
  if (!status) return "text-gray-500";
  if (SUCCESS.includes(status)) return "text-green-700";
  if (FAILED.includes(status)) return "text-red-600";
  return "text-amber-600";
}

// A4: member transaction history — package_name, amount, status badge.
export const PurchaseHistoryView = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetPaymentHistory(page, 20);
  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col w-full font-serif h-full text-brand-500">
      <NavHeaderComponent title="Purchase History" />
      <div className="flex flex-col gap-3 px-4 mt-4 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <PurchaseRow key={String(item.payment_id ?? item.order_id ?? i)} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ReceiptText className="text-gray-400" size={20} />
            </div>
            <p className="text-sm font-semibold text-brand-900">No purchases yet</p>
            <p className="max-w-[240px] text-xs text-gray-500">Your credit package purchases will appear here.</p>
            <Button className="mt-2" onClick={() => router.push("/topup-credit")}>
              Browse packages
            </Button>
          </div>
        )}
        {(pagination?.total_pages ?? 1) > 1 && (
          <CustomPagination
            onPageChange={(e) => setPage(e)}
            currentPage={page}
            hasNextPage={pagination?.has_next}
            hasPrevPage={pagination?.has_prev}
            totalItems={pagination?.total_items as number}
            totalPages={pagination?.total_pages as number}
            limit={pagination?.page_size ?? 20}
            position="center"
          />
        )}
      </div>
    </div>
  );
};

function PurchaseRow({ item }: { item: IPackagePaymentHistoryItem }) {
  const router = useRouter();
  const amount = item.gross_amount_idr ?? (item.amount_idr as number | undefined) ?? 0;
  const kind = item.payable_type ? String(item.payable_type) : "";
  const isPackage = kind === "package_purchase";
  const isBooking = kind === "booking";
  // Status endpoint takes the Midtrans-side id (PKG-…/BK-…) or the internal order id.
  const orderKey = item.provider_txn_id ? String(item.provider_txn_id) : item.order_id ? String(item.order_id) : "";
  const status = item.status ? String(item.status) : "pending";

  // 15-min window anchored on created_at (no expires_at in row yet) — ticks live.
  const [now, setNow] = useState(() => Date.now());
  const serverPending = status === "pending";
  useEffect(() => {
    if (!serverPending) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [serverPending]);
  const expiresAtMs = item.created_at ? Date.parse(String(item.created_at)) + 15 * 60 * 1000 : 0;
  const remainingMs = expiresAtMs - now;
  const timeExpired = serverPending && expiresAtMs > 0 && remainingMs <= 0;
  const displayStatus = timeExpired ? "expired" : status;
  const isPending = serverPending && !timeExpired;

  const title = isPackage
    ? String(item.package_name ?? "Credit package")
    : isBooking
      ? String(item.session_name ?? "Class booking")
      : "Payment";
  const subtitle = isPackage
    ? `${item.package_credits != null ? `${String(item.package_credits)} credits · ` : ""}${item.created_at ? formatDateHelper(String(item.created_at), "dd MMM yyyy · HH:mm") : ""}`
    : isBooking
      ? `${item.class_name ? `${String(item.class_name)} · ` : ""}${item.created_at ? formatDateHelper(String(item.created_at), "dd MMM yyyy · HH:mm") : ""}`
      : (item.created_at ? formatDateHelper(String(item.created_at), "dd MMM yyyy · HH:mm") : "");

  // Resume on the payment (pending) page — same as drop-in booking cash-payment page.
  // Row carries snap_redirect_url; never re-initiates for pending. Packages only —
  // booking resume lives in My Class, and there is no Buy-again action here.
  const handleContinue = () => {
    if (!item.package_id && !item.payable_id) {
      router.push("/topup-credit");
      return;
    }
    const packageId = String(item.package_id ?? item.payable_id ?? "");
    const rowUrl = typeof item.snap_redirect_url === "string" ? item.snap_redirect_url : null;
    const rowExpiry = typeof item.expires_at === "string" ? item.expires_at : null;
    const qs = new URLSearchParams({
      ...(orderKey ? { order_id: orderKey } : {}),
      ...(rowUrl ? { snap_redirect_url: rowUrl } : {}),
      ...(rowExpiry ? { expires_at: rowExpiry } : {}),
      ...(item.created_at ? { created_at: String(item.created_at) } : {}),
    });
    router.push(`/topup-credit/${packageId}/payment?${qs.toString()}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => item.payment_id && router.push(`/profile/purchase-history/${String(item.payment_id)}`)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && item.payment_id) {
          e.preventDefault();
          router.push(`/profile/purchase-history/${String(item.payment_id)}`);
        }
      }}
      className="cursor-pointer rounded-2xl border border-brand-100 bg-white px-4 py-3 active:bg-brand-25"
    >
      <div className="flex items-center gap-3">
        <span
          className={
            isPackage
              ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600"
          }
        >
          {isPackage ? <GemIcon size={15} className="text-white" /> : <TicketIcon size={15} className="text-white" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold text-brand-900">{title}</p>
            <p className="flex shrink-0 items-center gap-0.5">
              <span className="text-sm font-bold text-brand-900">{formatCurrency(String(amount))}</span>
              <ChevronRight size={15} className="text-gray-300" />
            </p>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] text-gray-500">{subtitle}</p>
            <p className={`flex shrink-0 items-center gap-1 text-[11px] font-medium ${statusText(displayStatus)}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot(displayStatus)}`} />
              {humanizePaymentStatus(displayStatus)}
            </p>
          </div>
          {isPending && expiresAtMs > 0 && (
            <p className="mt-0.5 font-mono text-[10px] font-bold text-red-600">Expires in {formatExpiryCountdown(remainingMs)}</p>
          )}
        </div>
      </div>
      {isPackage && isPending && (
        <Button
          className="mt-2.5 min-h-10 w-full text-xs font-extrabold"
          onClick={(e) => {
            e.stopPropagation();
            handleContinue();
          }}
        >
          Continue payment
        </Button>
      )}
    </div>
  );
}
