"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditLocationPage } from "@/view/admin-dashboard/location/edit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="locations:update">
      <EditLocationPage />
    </AdminPermissionGuard>
  );
}
