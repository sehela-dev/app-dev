import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { DiscountVoucherListPageView } from "@/view/admin-dashboard/discount-voucer/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vouchers — Sehela Admin",
  description: "Vouchers - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="voucher:view">
      <DiscountVoucherListPageView />
    </AdminPermissionGuard>
  );
}