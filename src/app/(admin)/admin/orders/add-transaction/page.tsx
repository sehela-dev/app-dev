"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AddTransactionPage } from "@/view/admin-dashboard/add-transaction";

export default function Page() {
  return (
    <AdminPermissionGuard permission="order:create">
      <AddTransactionPage />
    </AdminPermissionGuard>
  );
}
