import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { OrdersReportView } from "@/view/report/orders";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders Report — Sehela Admin",
  description: "Orders Monthly Report - Sehela Admin Panel",
};

export default function Page() {
  return (
    <AdminPermissionGuard permission="reports">
      <OrdersReportView />
    </AdminPermissionGuard>
  );
}
