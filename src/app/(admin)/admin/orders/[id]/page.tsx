"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { OrderReceiptPage } from "@/view/admin-dashboard/receipt";

export default function Page() {
  return (
    <AdminPermissionGuard permission="order:view">
      <OrderReceiptPage />
    </AdminPermissionGuard>
  );
}
