import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AdminManagementDetailPage } from "@/view/admin-dashboard/admin-management/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Detail — Sehela Admin",
  description: "Admin Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="admin:detail">
      <AdminManagementDetailPage />
    </AdminPermissionGuard>
  );
}