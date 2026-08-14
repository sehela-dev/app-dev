"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AdminManagementListPage } from "@/view/admin-dashboard/admin-management/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="admin:view">
      <AdminManagementListPage />
    </AdminPermissionGuard>
  );
}
