import AuthMemberGuard from "@/layout/authguard-member-layout";
import { CreditHistoryView } from "@/view/profile/credit-history";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit History — Sehela Space",
  description: "Credit History at Sehela Space",
};


export default function Page() {
  return (
    <AuthMemberGuard>
      <CreditHistoryView />
    </AuthMemberGuard>
  );
}