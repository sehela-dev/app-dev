import { Suspense } from "react";

import { SessionDetailView } from "@/view/book/sessions";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Detail — Sehela Space",
  description: "Session Detail at Sehela Space",
};


export default function Home() {
  return (
    <Suspense fallback={null}>
      <SessionDetailView />
    </Suspense>
  );
}