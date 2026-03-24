"use client";
import AuthMemberGuard from "@/layout/authguard-member-layout";

import { MyCreditsView } from "@/view/profile/my-credit";

export default function Home() {
  return (
    <AuthMemberGuard>
      <MyCreditsView />
    </AuthMemberGuard>
  );
}
