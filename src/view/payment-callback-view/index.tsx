"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetPaymentStatus } from "@/hooks/api/queries/customer/payments";

const SUCCESS_STATUSES = ["settlement", "capture"];
const FAILURE_STATUSES = ["deny", "cancel", "expire", "failure"];

export const PaymentCallbackView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const urlTransactionStatus = searchParams.get("transaction_status");

  // Verify actual status from backend (webhook may lag behind Midtrans redirect)
  const { data, isLoading } = useGetPaymentStatus(orderId);

  const serverStatus = data?.data?.transaction_status;
  const effectiveStatus = serverStatus ?? urlTransactionStatus ?? "";

  const isSuccess = SUCCESS_STATUSES.includes(effectiveStatus);
  const isFailed = FAILURE_STATUSES.includes(effectiveStatus);
  const isPending = !isSuccess && !isFailed;

  return (
    <div className="relative flex flex-col w-full gap-8 font-serif mx-auto pt-8 min-h-dvh text-brand-500">
      <div className="flex flex-col items-center gap-4 text-center mt-12 px-4">
        {isPending && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-brand-500" />
            <p className="font-extrabold text-xl">Processing Payment</p>
            <p className="font-normal text-brand-500/70 max-w-[280px]">
              We&apos;re confirming your payment. This usually takes just a few seconds.
            </p>
          </>
        )}

        {isSuccess && (
          <>
            <Image src={"/assets/view/success.png"} alt="success" width={120} height={120} />
            <p className="font-extrabold text-xl">Payment Success</p>
            <p className="font-normal">
              You&apos;re all set! Your spot at Sehela Space is confirmed.
            </p>
          </>
        )}

        {isFailed && (
          <>
            <Image src={"/assets/alert/no-session.png"} alt="failed" width={120} height={120} />
            <p className="font-extrabold text-xl">Payment Not Completed</p>
            <p className="font-normal text-brand-500/70 max-w-[280px]">
              Your payment didn&apos;t go through. Your booking is still reserved — you can try paying again from My
              Class.
            </p>
          </>
        )}

        {orderId && (
          <p className="text-xs text-brand-500/50 font-mono">Order ID: {orderId}</p>
        )}

        {!isLoading && (
          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            {isPending ? (
              <Button className="min-h-12 text-sm font-extrabold" disabled>
                Waiting for confirmation...
              </Button>
            ) : (
              <Button
                className="min-h-12 text-sm font-extrabold"
                onClick={() => router.push("/profile/my-sessions")}
              >
                View My Class
              </Button>
            )}
            {(isFailed || isPending) && (
              <Button variant="outline" className="min-h-12 text-sm font-extrabold" onClick={() => router.push("/book")}>
                Back to Book
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};