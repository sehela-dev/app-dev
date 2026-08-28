import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { DashboardPage } from "@/view/dashboard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Sehela Admin",
  description: "Dashboard - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="dashboard:view">
      <DashboardPage />
    </AdminPermissionGuard>
  );
}