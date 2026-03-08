"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditCreditPacakgesPage } from "@/view/admin-dashboard/credit-packages/edit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="credit_package:update">
      <EditCreditPacakgesPage />
    </AdminPermissionGuard>
  );
}
