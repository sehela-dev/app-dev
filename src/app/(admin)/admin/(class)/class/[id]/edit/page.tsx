import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";

import { EditClassPageView } from "@/view/admin-dashboard/class/edit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Class — Sehela Admin",
  description: "Edit Class - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="class:update">
      <EditClassPageView />
    </AdminPermissionGuard>
  );
}