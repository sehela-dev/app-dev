import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { DiscountVoucherListPageView } from "@/view/admin-dashboard/discount-voucer/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voucher Detail — Sehela Admin",
  description: "Voucher Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="voucher:view">
      <DiscountVoucherListPageView />
    </AdminPermissionGuard>
  );
}