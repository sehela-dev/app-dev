import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateSessionPageView } from "@/view/admin-dashboard/session/add-session";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Session — Sehela Admin",
  description: "Create Session - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="session:create">
      <CreateSessionPageView />
    </AdminPermissionGuard>
  );
}