"use client";

import { AuthCallBackPage } from "@/view/auth/callback";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <AuthCallBackPage />
    </Suspense>
  );
}
