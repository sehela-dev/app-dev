import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AdminManagementListPage } from "@/view/admin-dashboard/admin-management/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admins — Sehela Admin",
  description: "Admins - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="admin:view">
      <AdminManagementListPage />
    </AdminPermissionGuard>
  );
}