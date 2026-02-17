import { VerifyAccountPageView } from "@/view/auth/verify-account";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyAccountPageView />
    </Suspense>
  );
}
