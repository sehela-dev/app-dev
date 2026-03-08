"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { ClassListView } from "@/view/admin-dashboard/class/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="class:view">
      <ClassListView />
    </AdminPermissionGuard>
  );
}
