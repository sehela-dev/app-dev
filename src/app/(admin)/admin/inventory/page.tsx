"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { InventoryListPage } from "@/view/admin-dashboard/inventory/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="inventory:view">
      <InventoryListPage />
    </AdminPermissionGuard>
  );
}