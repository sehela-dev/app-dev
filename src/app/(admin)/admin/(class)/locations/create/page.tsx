"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateLocationPage } from "@/view/admin-dashboard/location/create";

export default function Page() {
  return (
    <AdminPermissionGuard permission="locations:create">
      <CreateLocationPage />
    </AdminPermissionGuard>
  );
}
