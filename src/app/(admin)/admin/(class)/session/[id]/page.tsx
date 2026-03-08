"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { SessionDetailPage } from "@/view/admin-dashboard/session/detail";

export default function Page() {
  return (
    <AdminPermissionGuard permission="session:detail">
      <SessionDetailPage />
    </AdminPermissionGuard>
  );
}
