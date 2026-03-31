"use client";
import { SessionFilterCtxProvider } from "@/context/session-filter.ctx";
import AuthMemberGuard from "@/layout/authguard-member-layout";

import { MySessionsPage } from "@/view/profile/my-sessions";

export default function Home() {
  return (
    <AuthMemberGuard>
      <SessionFilterCtxProvider>
        <MySessionsPage />
      </SessionFilterCtxProvider>
    </AuthMemberGuard>
  );
}
