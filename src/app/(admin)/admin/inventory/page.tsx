import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { InventoryListPage } from "@/view/admin-dashboard/inventory/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory — Sehela Admin",
  description: "Inventory - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="inventory:view">
      <InventoryListPage />
    </AdminPermissionGuard>
  );
}