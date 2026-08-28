import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { SessionDetailPage } from "@/view/admin-dashboard/session/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Detail — Sehela Admin",
  description: "Session Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="session:detail">
      <SessionDetailPage />
    </AdminPermissionGuard>
  );
}