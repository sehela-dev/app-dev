import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { RefundReportView } from "@/view/report/refund-report";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Report — Sehela Admin",
  description: "Refund & void report - Sehela Admin Panel",
};

export default function Page() {
  return (
    <AdminPermissionGuard permission="reports">
      <RefundReportView />
    </AdminPermissionGuard>
  );
}
