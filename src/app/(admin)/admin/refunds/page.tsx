"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { RefundManagementPageView } from "@/view/admin-dashboard/refunds";

export default function Page() {
  return (
    <AdminPermissionGuard permission="refund:view">
      <RefundManagementPageView />
    </AdminPermissionGuard>
  );
}