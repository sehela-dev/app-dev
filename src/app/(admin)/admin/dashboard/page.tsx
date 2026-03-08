"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { DashboardPage } from "@/view/dashboard";

export default function Page() {
  return (
    <AdminPermissionGuard permission="dashboard:view">
      <DashboardPage />
    </AdminPermissionGuard>
  );
}
