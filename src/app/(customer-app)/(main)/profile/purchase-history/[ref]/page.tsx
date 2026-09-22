import AuthMemberGuard from "@/layout/authguard-member-layout";
import { PurchaseHistoryDetailView } from "@/view/profile/purchase-history/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Detail — Sehela Space",
  description: "Payment detail at Sehela Space",
};


export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  // :ref = payment uuid, readable order_id, or PKG-… (own payment only, else 404 page).
  return (
    <AuthMemberGuard>
      <PurchaseHistoryDetailView refId={decodeURIComponent(ref)} />
    </AuthMemberGuard>
  );
}
