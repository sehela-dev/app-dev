"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AuditLogListPage } from "@/view/admin-dashboard/audit-log/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="audit-log:view">
      <AuditLogListPage />
    </AdminPermissionGuard>
  );
}
