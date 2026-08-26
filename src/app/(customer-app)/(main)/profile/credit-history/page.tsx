"use client";
import AuthMemberGuard from "@/layout/authguard-member-layout";
import { CreditHistoryView } from "@/view/profile/credit-history";

export default function Page() {
  return (
    <AuthMemberGuard>
      <CreditHistoryView />
    </AuthMemberGuard>
  );
}
