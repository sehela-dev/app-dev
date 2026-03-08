"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CustomersPage } from "@/view/admin-dashboard/customer/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="member:view">
      <CustomersPage />
    </AdminPermissionGuard>
  );
}
