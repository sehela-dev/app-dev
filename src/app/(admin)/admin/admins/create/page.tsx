"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateAdminPage } from "@/view/admin-dashboard/admin-management/create";

export default function Page() {
  return (
    <AdminPermissionGuard permission="admin:create">
      <CreateAdminPage />
    </AdminPermissionGuard>
  );
}
