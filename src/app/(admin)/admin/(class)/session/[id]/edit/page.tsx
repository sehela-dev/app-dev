"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditSessionPage } from "@/view/admin-dashboard/session/edit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="session:update">
      <EditSessionPage />
    </AdminPermissionGuard>
  );
}
