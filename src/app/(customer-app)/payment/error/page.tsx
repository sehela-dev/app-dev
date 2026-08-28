import { PaymentCallbackView } from "@/view/payment-callback-view";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Issue — Sehela Space",
  description: "Payment Issue at Sehela Space",
};


export default function PaymentErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentCallbackView />
    </Suspense>
  );
}