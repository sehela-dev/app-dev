import { CartView } from "@/view/cart";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart — Sehela Space",
  description: "Cart at Sehela Space",
};


export default function Home() {
  return <CartView />;
}