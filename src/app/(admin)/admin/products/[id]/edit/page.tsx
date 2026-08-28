import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { OrdersPageView } from "@/view/admin-dashboard/orders";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Product — Sehela Admin",
  description: "Edit Product - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="products:update">
      <OrdersPageView />
    </AdminPermissionGuard>
  );
}