import { PaymentCallbackView } from "@/view/payment-callback-view";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

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
