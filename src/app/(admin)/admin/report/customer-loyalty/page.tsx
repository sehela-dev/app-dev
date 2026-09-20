import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CustomerLoyaltyView } from "@/view/report/customer-loyalty";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Loyalty — Sehela Admin",
  description: "Per-customer loyalty summary - Sehela Admin Panel",
};

export default function Page() {
  return (
    <AdminPermissionGuard permission="reports">
      <CustomerLoyaltyView />
    </AdminPermissionGuard>
  );
}
