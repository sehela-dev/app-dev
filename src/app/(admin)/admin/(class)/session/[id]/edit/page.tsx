import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditSessionPage } from "@/view/admin-dashboard/session/edit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Session — Sehela Admin",
  description: "Edit Session - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="session:update">
      <EditSessionPage />
    </AdminPermissionGuard>
  );
}