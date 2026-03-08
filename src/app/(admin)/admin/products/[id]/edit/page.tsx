"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { OrdersPageView } from "@/view/admin-dashboard/orders";

export default function Page() {
  return (
    <AdminPermissionGuard permission="products:update">
      <OrdersPageView />
    </AdminPermissionGuard>
  );
}
