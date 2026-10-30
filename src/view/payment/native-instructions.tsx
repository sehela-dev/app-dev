"use client";

import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { PaymentInstructions } from "@/types/customer-app/payment.interface";

type NativeInstructions = Exclude<PaymentInstructions, { type: "redirect" }>;

interface NativeInstructionsProps {
  instructions: NativeInstructions;
  amountIdr: number;
  channelLabel?: string | null;
  remainingMs: number | null;
}

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
};

// Display-only grouping; the copy button always uses the raw value.
const groupVaNumber = (value: string) => value.replace(/(\d{4})(?=\d)/g, "$1 ");

const copyValue = async (value: string, label: string) => {
  try {
    if (!navigator.clipboard) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`, { position: "top-center" });
  } catch {
    toast.error("Copy failed", {
      description: `Select the ${label.toLowerCase()} and copy it manually.`,
      position: "top-center",
    });
  }
};

const CopyRow = ({
  label,
  value,
  display,
  disabled,
}: {
  label: string;
  value: string;
  display?: string;
  disabled?: boolean;
}) => (
  <div className="rounded-lg border border-brand-100 bg-white p-3">
    <p className="text-xs text-brand-500/60">{label}</p>
    <div className="mt-1 flex items-center justify-between gap-3">
      <input
        readOnly
        value={display ?? value}
        onFocus={(event) => event.currentTarget.select()}
        className="w-full min-w-0 bg-transparent font-mono text-base font-bold text-brand-700 outline-none"
        aria-label={label}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => void copyValue(value, label)}
        className="shrink-0 rounded-lg border-brand-200"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </Button>
    </div>
  </div>
);

const QrBlock = ({ value, alt }: { value: string; alt: string }) => (
  <div className="mx-auto w-fit rounded-xl border border-brand-100 bg-white p-4">
    <QRCode value={value} size={220} bgColor="#ffffff" fgColor="#000000" aria-label={alt} />
  </div>
);

const QrImage = ({ url, alt }: { url: string; alt: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={url} alt={alt} className="mx-auto h-[220px] w-[220px] object-contain" />
);

export const NativeInstructionsComponent = ({
  instructions,
  amountIdr,
  channelLabel,
  remainingMs,
}: NativeInstructionsProps) => {
  const isMobile = useIsMobile();
  const expired = remainingMs !== null && remainingMs <= 0;

  return (
    <div className="mb-6 rounded-xl border border-brand-200 bg-brand-25 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-700">
            {instructions.type === "va"
              ? `Transfer to ${channelLabel || instructions.va.bank.replace(/_/g, " ").toUpperCase()}`
              : instructions.type === "qris"
                ? "QRIS"
                : "GoPay"}
          </p>
          <p className="text-xs text-brand-500/60">Amount {formatCurrency(amountIdr)}</p>
        </div>
        {remainingMs !== null && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-xs font-bold",
              expired ? "bg-zinc-100 text-zinc-500" : "bg-red-50 text-red-600",
            )}
          >
            {expired ? "Expired" : formatCountdown(remainingMs)}
          </span>
        )}
      </div>

      {instructions.type === "va" && (() => {
        const { va } = instructions;
        const isMandiri = Boolean(va.biller_code || va.bill_key);
        return (
          <div className="flex flex-col gap-2">
            {isMandiri ? (
              <>
                {va.biller_code && <CopyRow label="Biller Code" value={va.biller_code} disabled={expired} />}
                {va.bill_key && <CopyRow label="Bill Key" value={va.bill_key} disabled={expired} />}
              </>
            ) : va.va_number ? (
              <CopyRow label="Virtual Account Number" value={va.va_number} display={groupVaNumber(va.va_number)} disabled={expired} />
            ) : (
              <p className="text-sm text-brand-500/70">Virtual account number is unavailable. Refresh the page.</p>
            )}
            <p className="text-xs text-brand-500/60">Transfer the exact amount. Payment is confirmed automatically.</p>
          </div>
        );
      })()}

      {instructions.type === "qris" && (
        <div className="flex flex-col items-center gap-3">
          {instructions.qris.qr_string ? (
            <QrBlock value={instructions.qris.qr_string} alt="QRIS payment code" />
          ) : instructions.qris.qr_url ? (
            <QrImage url={instructions.qris.qr_url} alt="QRIS payment code" />
          ) : (
            <p className="text-sm text-brand-500/70">QR code is unavailable. Refresh the page.</p>
          )}
          <p className="text-center text-sm text-brand-500/70">Scan with any QRIS app (GoPay, OVO, DANA, ShopeePay, …).</p>
        </div>
      )}

      {instructions.type === "ewallet" && (() => {
        const { ewallet } = instructions;
        const hasQr = Boolean(ewallet.qr_string || ewallet.qr_url);
        return (
          <div className="flex flex-col items-center gap-3">
            {hasQr && (
              <>
                {ewallet.qr_string ? (
                  <QrBlock value={ewallet.qr_string} alt="GoPay payment code" />
                ) : (
                  <QrImage url={ewallet.qr_url as string} alt="GoPay payment code" />
                )}
                <p className="text-center text-sm text-brand-500/70">Scan with the GoPay app to pay.</p>
              </>
            )}

            {isMobile && ewallet.deeplink_url && (
              <Button
                type="button"
                disabled={expired}
                onClick={() => {
                  if (ewallet.deeplink_url) window.location.href = ewallet.deeplink_url;
                }}
                className={cn("w-full rounded-xl", hasQr ? "bg-white text-brand-600 border border-brand-200" : "bg-brand-500 text-white")}
                variant={hasQr ? "outline" : "default"}
              >
                Open GoPay
              </Button>
            )}

            {!isMobile && !hasQr && ewallet.deeplink_url && (
              <div className="text-center">
                <a href={ewallet.deeplink_url} className="text-sm font-semibold text-brand-600 underline underline-offset-4">
                  Open GoPay on your phone
                </a>
                <p className="mt-1 text-xs text-brand-500/60">The GoPay link only works on a mobile device.</p>
              </div>
            )}

            {!hasQr && !ewallet.deeplink_url && (
              <p className="text-sm text-brand-500/70">GoPay payment details are unavailable. Refresh the page.</p>
            )}
          </div>
        );
      })()}
    </div>
  );
};
