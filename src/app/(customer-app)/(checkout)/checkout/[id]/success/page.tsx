import { SuccessBookView } from "@/view/book-success-view";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmed — Sehela Space",
  description: "Booking Confirmed at Sehela Space",
};


export default function Home() {
  return <SuccessBookView />;
}