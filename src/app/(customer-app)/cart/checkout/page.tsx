import { CartCheckoutView } from "@/view/cart/checkout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart Checkout — Sehela Space",
  description: "Cart Checkout at Sehela Space",
};


export default function Home() {
  return <CartCheckoutView />;
}