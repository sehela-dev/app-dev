"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateDiscountVoucherPage } from "@/view/admin-dashboard/discount-voucer/add";

export default function Page() {
  return (
    <AdminPermissionGuard permission="voucher:create">
      <CreateDiscountVoucherPage />
    </AdminPermissionGuard>
  );
}
