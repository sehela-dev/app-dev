import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { OrdersPageView } from "@/view/admin-dashboard/orders";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders — Sehela Admin",
  description: "Orders - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="order:view">
      <OrdersPageView />
    </AdminPermissionGuard>
  );
}