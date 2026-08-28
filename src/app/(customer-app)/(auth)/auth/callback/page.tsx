import { AuthCallBackPage } from "@/view/auth/callback";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authenticating — Sehela Space",
  description: "Authenticating at Sehela Space",
};


export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AuthCallBackPage />
    </Suspense>
  );
}