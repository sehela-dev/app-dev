import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditAdminPage } from "@/view/admin-dashboard/admin-management/edit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Admin — Sehela Admin",
  description: "Edit Admin - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="admin:update">
      <EditAdminPage />
    </AdminPermissionGuard>
  );
}