import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { RefundManagementPageView } from "@/view/admin-dashboard/refunds";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refunds — Sehela Admin",
  description: "Refunds - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="refund:view">
      <RefundManagementPageView />
    </AdminPermissionGuard>
  );
}