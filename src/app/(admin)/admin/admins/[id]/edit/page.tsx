"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditAdminPage } from "@/view/admin-dashboard/admin-management/edit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="admin:update">
      <EditAdminPage />
    </AdminPermissionGuard>
  );
}
