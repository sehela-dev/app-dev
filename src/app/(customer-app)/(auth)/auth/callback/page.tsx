import { AuthCallBackPage } from "@/view/auth/callback";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AuthCallBackPage />
    </Suspense>
  );
}
