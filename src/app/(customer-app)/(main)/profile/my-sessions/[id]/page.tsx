import { SessionFilterCtxProvider } from "@/context/session-filter.ctx";
import AuthMemberGuard from "@/layout/authguard-member-layout";

import { MySessionDetail } from "@/view/profile/my-sessions/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Session Detail — Sehela Space",
  description: "My Session Detail at Sehela Space",
};


export default function Home() {
  return (
    <AuthMemberGuard>
      <SessionFilterCtxProvider>
        <MySessionDetail />
      </SessionFilterCtxProvider>
    </AuthMemberGuard>
  );
}