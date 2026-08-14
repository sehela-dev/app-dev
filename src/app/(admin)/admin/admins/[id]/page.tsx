"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AdminManagementDetailPage } from "@/view/admin-dashboard/admin-management/detail";

export default function Page() {
  return (
    <AdminPermissionGuard permission="admin:detail">
      <AdminManagementDetailPage />
    </AdminPermissionGuard>
  );
}
