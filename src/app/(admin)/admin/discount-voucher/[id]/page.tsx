"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { DiscountVoucherListPageView } from "@/view/admin-dashboard/discount-voucer/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="voucher:view">
      <DiscountVoucherListPageView />
    </AdminPermissionGuard>
  );
}
