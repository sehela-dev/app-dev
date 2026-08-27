"use client";
import { CalendarMinus, MapPin, User, Clock, CreditCard, XCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDateHelper } from "@/lib/helper";

interface IMySessionCardProps {
  time: string;
  duration: string;
  title: string;
  location: string;
  date: string;
  instructor?: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  bookingId: string;
  classSessionId: string;
  createdAt?: string | null;
  computedStatus?: string | null;
  isEnded?: boolean | null;
  sessionStatus?: string | null;
  onClick?: () => void;
}

function ensureHHmm(time: string) {
  if (!time) return "--:--";
  const parts = time.trim().split(":");
  if (parts.length < 2) return time;
  const h = parts[0].padStart(2, "0");
  const m = parts[1].padStart(2, "0");
  // handle if input was like "7:5" -> "07:05"
  // also guard against "07:05:00" extra seconds
  return `${h.slice(-2)}:${m.slice(-2)}`;
}

const FAILED_STATUSES = ["cancel", "cancelled", "canceled", "expire", "expired", "deny", "failure", "voided", "refunded"];

export const MySessionCardComponent = ({
  time,
  duration,
  title,
  location,
  date,
  instructor,
  bookingStatus,
  paymentStatus,
  paymentMethod,
  bookingId,
  classSessionId,
  createdAt,
  computedStatus,
  isEnded,
  sessionStatus,
  onClick,
}: IMySessionCardProps) => {
  const router = useRouter();

  const normalizedBooking = bookingStatus?.toLowerCase() ?? "";
  const normalizedPayment = paymentStatus?.toLowerCase() ?? "";
  const normalizedSession = (sessionStatus ?? computedStatus ?? "").toLowerCase();

  const isSessionCanceled = normalizedSession === "canceled" || normalizedSession === "cancelled";
  const isSessionEnded = normalizedSession === "ended" || !!isEnded;
  const isSessionOngoing = normalizedSession === "ongoing";
  const isSessionScheduled = normalizedSession === "scheduled";

  const isCancelled =
    normalizedBooking === "cancelled" ||
    normalizedBooking === "canceled" ||
    normalizedBooking === "expired" ||
    FAILED_STATUSES.includes(normalizedPayment) ||
    isSessionCanceled;

  // pending only if not already cancelled/ended
  const isPendingPayment = !isCancelled && !isSessionEnded && !isSessionCanceled && !isSessionOngoing && (normalizedBooking === "pending_payment" || normalizedPayment === "pending");

  const isConfirmed =
    !isCancelled &&
    !isPendingPayment &&
    !isSessionEnded &&
    !isSessionCanceled &&
    (normalizedBooking === "confirmed" || normalizedBooking === "upcoming" || normalizedPayment === "paid" || normalizedPayment === "settlement" || normalizedPayment === "capture");

  const isUpcoming = isSessionScheduled || (isConfirmed && normalizedBooking === "upcoming");

  const hhmm = ensureHHmm(time);
  const durationLabel = duration ? `${duration} min` : "";

  const isExpired = normalizedBooking === "expired" || normalizedPayment === "expired" || normalizedPayment === "expire";
  const statusMeta = (() => {
    if (isCancelled) {
      if (isExpired) {
        return {
          label: "Expired",
          badgeClass: "bg-violet-200 text-violet-800 border-violet-200",
          accent: "border-l-violet-500",
          timePill: "bg-violet-200 text-violet-800 border-violet-200",
          icon: Clock,
        };
      }
      return {
        label: "Cancelled",
        badgeClass: "bg-red-200/40 text-red-800 border-red-200",
        accent: "border-l-red-500",
        timePill: "bg-red-200/30 text-red-800 border-red-200",
        icon: XCircle,
      };
    }
    if (isSessionEnded) {
      return {
        label: "Ended",
        badgeClass: "bg-gray-200 text-gray-700 border-gray-300",
        accent: "border-l-gray-400",
        timePill: "bg-gray-200 text-gray-700 border-gray-300",
        icon: Clock,
      };
    }
    if (isSessionOngoing) {
      return {
        label: "Ongoing",
        badgeClass: "bg-blue-200 text-blue-800 border-blue-200",
        accent: "border-l-blue-500",
        timePill: "bg-blue-200 text-blue-800 border-blue-200",
        icon: Clock,
      };
    }
    if (isPendingPayment) {
      return {
        label: "Pending Payment",
        badgeClass: "bg-yellow-200 text-yellow-800 border-yellow-200",
        accent: "border-l-yellow-500",
        timePill: "bg-yellow-200/50 text-yellow-800 border-yellow-200",
        icon: AlertCircle,
      };
    }
    if (isConfirmed) {
      // brand is main color — use brand palette for positive states
      if (isUpcoming) {
        return {
          label: "Upcoming",
          badgeClass: "bg-brand-25 text-brand-700 border-brand-100",
          accent: "border-l-brand-400",
          timePill: "bg-brand-25 text-brand-700 border-brand-100",
          icon: CheckCircle2,
        };
      }
      return {
        label: "Confirmed",
        badgeClass: "bg-brand-50 text-brand-700 border-brand-200",
        accent: "border-l-brand-500",
        timePill: "bg-brand-50 text-brand-700 border-brand-200",
        icon: CheckCircle2,
      };
    }
    return {
      label: bookingStatus ? bookingStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—",
      badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
      accent: "border-l-gray-300",
      timePill: "bg-gray-100 text-gray-700 border-gray-200",
      icon: Clock,
    };
  })();

  const BadgeIcon = statusMeta.icon;

  // 15m expiry countdown — uses bookings.created_at (added 2026-08-24) — ponytail: client-only timer, BE is source of truth
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isPendingPayment || !createdAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isPendingPayment, createdAt]);
  const expiresAtMs = createdAt ? new Date(createdAt).getTime() + 15 * 60 * 1000 : null;
  const remainingMs = expiresAtMs ? expiresAtMs - now : null;
  const remainingLabel =
    isPendingPayment && remainingMs !== null
      ? remainingMs <= 0
        ? "Expired"
        : `${String(Math.floor(remainingMs / 60000)).padStart(2, "0")}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0")} left`
      : null;
  const expiresLabel = expiresAtMs
    ? new Date(expiresAtMs).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    : null;

  const handlePayNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/checkout/${classSessionId}/cash-payment?booking_id=${bookingId}`);
  };

  return (
    <div className="relative w-full">
      <div
        onClick={onClick}
        className={cn(
          "group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-brand-200 cursor-pointer border-l-4",
          statusMeta.accent,
          isCancelled && "opacity-[0.98] hover:opacity-100",
          isPendingPayment && "shadow-[0_2px_12px_rgba(234,179,8,0.15)]"
        )}
      >
        {/* Header: title + status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 text-[15px] font-semibold leading-snug text-gray-900 line-clamp-2">{title}</h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
              statusMeta.badgeClass
            )}
          >
            <BadgeIcon className={cn("h-3.5 w-3.5", isPendingPayment && "animate-pulse")} />
            {statusMeta.label}
          </span>
        </div>

        {/* Time + duration + date */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide",
              statusMeta.timePill
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {hhmm} WIB
            {durationLabel && <span className="opacity-60">•</span>}
            {durationLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarMinus className="h-3.5 w-3.5 text-brand-300" />
            {date}
          </span>
        </div>

        {/* Divider */}
        <div className="my-3 h-px w-full bg-brand-50" />

        {/* Details */}
        <div className="flex flex-col gap-1.5">
          <p className="flex items-start gap-2 text-sm leading-snug text-gray-600">
            <MapPin size={14} className="mt-0.5 shrink-0 text-brand-400" />
            <span className="line-clamp-1">{location}</span>
          </p>
          {instructor && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <User size={14} className="shrink-0 text-brand-400" />
              {instructor}
            </p>
          )}
          {sessionStatus && (
            <p className="flex items-center gap-2 text-xs text-gray-500 capitalize">
              <Clock size={12} className="shrink-0 text-brand-300" />
              Session: {sessionStatus}
              {computedStatus && computedStatus.toLowerCase() !== sessionStatus.toLowerCase() ? ` → ${computedStatus}` : ""}
              {isEnded ? " (ended)" : ""}
            </p>
          )}
          {createdAt && (
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} className="shrink-0 text-brand-300" />
              Booked {formatDateHelper(createdAt, "dd MMM HH:mm")} WIB
              {isPendingPayment && expiresLabel ? ` • Expires ${expiresLabel} WIB` : ""}
            </p>
          )}
        </div>

        {/* Action — brand is main color */}
        {isPendingPayment && (
          <>
            <Button
              size="sm"
              className="mt-3 w-full rounded-xl bg-brand-500 font-semibold text-white hover:bg-brand-600 shadow-sm"
              onClick={handlePayNow}
            >
              <CreditCard className="h-4 w-4" />
              Pay Now — {hhmm} WIB
            </Button>
            {remainingLabel && (
              <p className="mt-1.5 text-center text-xs font-medium text-amber-700">
                {remainingLabel === "Expired" ? "Expired — please re-book" : `${remainingLabel} left to pay`}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
