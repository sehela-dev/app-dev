import AuthMemberGuard from "@/layout/authguard-member-layout";
import { PackagePaymentView } from "@/view/top-up/payment";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Payment — Sehela Space",
  description: "Complete your credit package payment at Sehela Space",
};


export default function Page() {
  // Pending host page (mirrors checkout/[id]/cash-payment): member JWT required.
  return (
    <AuthMemberGuard>
      <PackagePaymentView />
    </AuthMemberGuard>
  );
}
