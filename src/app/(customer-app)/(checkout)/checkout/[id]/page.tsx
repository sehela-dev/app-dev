import { CheckoutSessionView } from "@/view/checkout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — Sehela Space",
  description: "Checkout at Sehela Space",
};


export default function Home() {
  return <CheckoutSessionView />;
}