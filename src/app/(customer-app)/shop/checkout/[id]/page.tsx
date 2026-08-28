import { CheckoutShopSessionView } from "@/view/checkout/shop";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Checkout — Sehela Space",
  description: "Shop Checkout at Sehela Space",
};


export default function Home() {
  return <CheckoutShopSessionView />;
}