"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { LocationDetailPage } from "@/view/admin-dashboard/location/detail";

export default function Page() {
  return (
    <AdminPermissionGuard permission="locations:detail">
      <LocationDetailPage />
    </AdminPermissionGuard>
  );
}
