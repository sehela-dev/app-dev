"use client";
import { SessionFilterCtxProvider } from "@/context/session-filter.ctx";
import AuthMemberGuard from "@/layout/authguard-member-layout";

import { MySessionDetail } from "@/view/profile/my-sessions/detail";

export default function Home() {
  return (
    <AuthMemberGuard>
      <SessionFilterCtxProvider>
        <MySessionDetail />
      </SessionFilterCtxProvider>
    </AuthMemberGuard>
  );
}
