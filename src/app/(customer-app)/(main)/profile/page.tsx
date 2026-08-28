import AuthMemberGuard from "@/layout/authguard-member-layout";
import { ProfilePageView } from "@/view/customer-profile";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile — Sehela Space",
  description: "My Profile at Sehela Space",
};


export default function Home() {
  return (
    <AuthMemberGuard>
      <ProfilePageView />
    </AuthMemberGuard>
  );
}