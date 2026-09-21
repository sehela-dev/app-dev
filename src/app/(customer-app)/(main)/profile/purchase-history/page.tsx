import AuthMemberGuard from "@/layout/authguard-member-layout";
import { PurchaseHistoryView } from "@/view/profile/purchase-history";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase History — Sehela Space",
  description: "Credit package purchase history at Sehela Space",
};


export default function Page() {
  return (
    <AuthMemberGuard>
      <PurchaseHistoryView />
    </AuthMemberGuard>
  );
}
