import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { StockReportView } from "@/view/report/stock";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Report — Sehela Admin",
  description: "Product and inventory stock preview and CSV export - Sehela Admin Panel",
};

export default function Page() {
  return (
    <AdminPermissionGuard permission="reports">
      <StockReportView />
    </AdminPermissionGuard>
  );
}
