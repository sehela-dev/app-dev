import type { Metadata } from "next";
import CashPaymentClient from "./_client";

export const metadata: Metadata = {
  title: "Payment — Sehela Space",
  description: "Complete your payment for Sehela Space booking",
};

export default function Page() {
  return <CashPaymentClient />;
}
