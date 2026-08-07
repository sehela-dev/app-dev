"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { LocationListView } from "@/view/admin-dashboard/location/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="locations:view">
      <LocationListView />
    </AdminPermissionGuard>
  );
}
