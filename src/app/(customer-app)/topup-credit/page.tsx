import AuthMemberGuard from "@/layout/authguard-member-layout";
import { TopUpCreditPageView } from "@/view/top-up";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Up Credits — Sehela Space",
  description: "Top Up Credits at Sehela Space",
};


export default function Home() {
  return (
    <AuthMemberGuard>
      <TopUpCreditPageView />
    </AuthMemberGuard>
  );
}