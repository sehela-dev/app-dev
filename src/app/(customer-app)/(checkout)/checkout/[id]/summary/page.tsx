import { CheckoutCashSummarySessionView } from "@/view/checkout/summary";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Summary — Sehela Space",
  description: "Checkout Summary at Sehela Space",
};


export default function Home() {
  return <CheckoutCashSummarySessionView />;
}