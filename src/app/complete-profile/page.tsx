"use client";
import { CompleteProfilePageView } from "@/view/auth/complete-profile";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <CompleteProfilePageView />
    </Suspense>
  );
}
