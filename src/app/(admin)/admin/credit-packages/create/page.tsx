"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AddCreditPacakgesPage } from "@/view/admin-dashboard/credit-packages/add";

export default function Page() {
  return (
    <AdminPermissionGuard permission="credit_package:create">
      <AddCreditPacakgesPage />
    </AdminPermissionGuard>
  );
}
