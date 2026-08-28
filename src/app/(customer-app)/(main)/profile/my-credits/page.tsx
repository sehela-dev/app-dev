import AuthMemberGuard from "@/layout/authguard-member-layout";

import { MyCreditsView } from "@/view/profile/my-credit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Credits — Sehela Space",
  description: "My Credits at Sehela Space",
};


export default function Home() {
  return (
    <AuthMemberGuard>
      <MyCreditsView />
    </AuthMemberGuard>
  );
}