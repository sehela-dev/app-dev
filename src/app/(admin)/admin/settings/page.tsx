"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AdminSettingsPage } from "@/view/admin-dashboard/settings";

export default function Page() {
  return (
    <AdminPermissionGuard permission="settings:view">
      <AdminSettingsPage />
    </AdminPermissionGuard>
  );
}
