import { CheckoutSuccessView } from "@/view/checkout-success";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed — Sehela Space",
  description: "Order Confirmed at Sehela Space",
};


export default function Home() {
  return <CheckoutSuccessView />;
}