import AuthMemberGuard from "@/layout/authguard-member-layout";
import { UpdateProfilePage } from "@/view/profile/update";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Profile — Sehela Space",
  description: "Update Profile at Sehela Space",
};


export default function Home() {
  return (
    <AuthMemberGuard>
      <UpdateProfilePage />
    </AuthMemberGuard>
  );
}