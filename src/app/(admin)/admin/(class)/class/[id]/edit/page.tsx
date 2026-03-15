"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";

import { EditClassPageView } from "@/view/admin-dashboard/class/edit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="class:update">
      <EditClassPageView />
    </AdminPermissionGuard>
  );
}
