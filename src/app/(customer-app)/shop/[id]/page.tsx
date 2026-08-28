import { ShopDetailView } from "@/view/shop/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Detail — Sehela Space",
  description: "Product Detail at Sehela Space",
};


export default function Home() {
  return <ShopDetailView />;
}