import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateAdminPage } from "@/view/admin-dashboard/admin-management/create";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Admin — Sehela Admin",
  description: "Create Admin - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="admin:create">
      <CreateAdminPage />
    </AdminPermissionGuard>
  );
}