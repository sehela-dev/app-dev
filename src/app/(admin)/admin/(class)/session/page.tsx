import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { SessionListPage } from "@/view/admin-dashboard/session/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sessions — Sehela Admin",
  description: "Sessions - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="session:view">
      <SessionListPage />
    </AdminPermissionGuard>
  );
}