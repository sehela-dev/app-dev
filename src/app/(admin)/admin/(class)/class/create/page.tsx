import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AddClassPageView } from "@/view/admin-dashboard/class/add-class";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Class — Sehela Admin",
  description: "Create Class - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="class:create">
      <AddClassPageView />
    </AdminPermissionGuard>
  );
}