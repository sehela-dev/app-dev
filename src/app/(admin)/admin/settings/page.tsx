import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AdminSettingsPage } from "@/view/admin-dashboard/settings";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Sehela Admin",
  description: "Settings - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="settings:view">
      <AdminSettingsPage />
    </AdminPermissionGuard>
  );
}