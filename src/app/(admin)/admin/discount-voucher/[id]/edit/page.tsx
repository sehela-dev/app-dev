"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditDiscountVoucherPage } from "@/view/admin-dashboard/discount-voucer/edit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="voucher:update">
      <EditDiscountVoucherPage />
    </AdminPermissionGuard>
  );
}
