"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CustomerDetailPage } from "@/view/admin-dashboard/customer/detail";

export default function Page() {
  return (
    <AdminPermissionGuard permission="member:detail">
      <CustomerDetailPage />
    </AdminPermissionGuard>
  );
}
