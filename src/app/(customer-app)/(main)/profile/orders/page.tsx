import AuthMemberGuard from "@/layout/authguard-member-layout";
import { OrderListView } from "@/view/profile/orders";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders — Sehela Space",
  description: "Your product orders",
};

export default function Page() {
  return (
    <AuthMemberGuard>
      <OrderListView />
    </AuthMemberGuard>
  );
}
