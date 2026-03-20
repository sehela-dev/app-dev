"use client";
import AuthMemberGuard from "@/layout/authguard-member-layout";
import { TopUpCreditPageView } from "@/view/top-up";

export default function Home() {
  return (
    <AuthMemberGuard>
      <TopUpCreditPageView />
    </AuthMemberGuard>
  );
}
