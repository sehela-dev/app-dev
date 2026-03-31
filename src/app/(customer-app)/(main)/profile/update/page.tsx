"use client";

import AuthMemberGuard from "@/layout/authguard-member-layout";
import { UpdateProfilePage } from "@/view/profile/update";

export default function Home() {
  return (
    <AuthMemberGuard>
      <UpdateProfilePage />
    </AuthMemberGuard>
  );
}
