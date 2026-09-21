import { TopUpCreditDetailView } from "@/view/top-up/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Package Detail — Sehela Space",
  description: "Credit package detail at Sehela Space",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Public (A2): no login required; hidden/inactive renders "not available".
  return <TopUpCreditDetailView id={id} />;
}
