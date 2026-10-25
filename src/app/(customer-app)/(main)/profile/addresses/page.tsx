import AuthMemberGuard from "@/layout/authguard-member-layout";
import { AddressListView } from "@/view/profile/addresses";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Address Book — Sehela Space",
  description: "Manage your delivery addresses",
};

export default function Page() {
  return (
    <AuthMemberGuard>
      <AddressListView />
    </AuthMemberGuard>
  );
}
