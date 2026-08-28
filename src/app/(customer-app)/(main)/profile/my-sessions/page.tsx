import { SessionFilterCtxProvider } from "@/context/session-filter.ctx";
import AuthMemberGuard from "@/layout/authguard-member-layout";

import { MySessionsPage } from "@/view/profile/my-sessions";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Sessions — Sehela Space",
  description: "My Sessions at Sehela Space",
};


export default function Home() {
  return (
    <AuthMemberGuard>
      <SessionFilterCtxProvider>
        <MySessionsPage />
      </SessionFilterCtxProvider>
    </AuthMemberGuard>
  );
}