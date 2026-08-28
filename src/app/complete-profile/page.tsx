import { CompleteProfilePageView } from "@/view/auth/complete-profile";
import { Suspense } from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Profile — Sehela Space",
  description: "Complete Profile at Sehela Space",
};


export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <CompleteProfilePageView />
    </Suspense>
  );
}