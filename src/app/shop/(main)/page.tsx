"use client";
import { ShopPageView } from "@/view/shop";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopPageView />
    </Suspense>
  );
}
