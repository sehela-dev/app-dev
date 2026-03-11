"use client";
import AuthMemberGuard from "@/layout/authguard-member-layout";
import { ProfilePageView } from "@/view/customer-profile";

export default function Home() {
  return (
    <AuthMemberGuard>
      <ProfilePageView />
    </AuthMemberGuard>
  );
}
