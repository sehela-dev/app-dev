import AuthMemberGuard from "@/layout/authguard-member-layout";
import { OrderDetailView } from "@/view/profile/orders/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Detail — Sehela Space",
  description: "Product order detail",
};

export default function Page() {
  return (
    <AuthMemberGuard>
      <OrderDetailView />
    </AuthMemberGuard>
  );
}
