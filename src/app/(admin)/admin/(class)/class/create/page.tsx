"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AddClassPageView } from "@/view/admin-dashboard/class/add-class";

export default function Page() {
  return (
    <AdminPermissionGuard permission="class:create">
      <AddClassPageView />
    </AdminPermissionGuard>
  );
}
