import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AuditLogListPage } from "@/view/admin-dashboard/audit-log/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs — Sehela Admin",
  description: "Audit Logs - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="audit-log:view">
      <AuditLogListPage />
    </AdminPermissionGuard>
  );
}