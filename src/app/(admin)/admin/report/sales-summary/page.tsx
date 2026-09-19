import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { SalesSummaryView } from "@/view/report/sales-summary";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Summary — Sehela Admin",
  description: "Daily collected-sales summary - Sehela Admin Panel",
};

export default function Page() {
  return (
    <AdminPermissionGuard permission="reports">
      <SalesSummaryView />
    </AdminPermissionGuard>
  );
}
