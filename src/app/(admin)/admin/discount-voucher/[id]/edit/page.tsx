import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditDiscountVoucherPage } from "@/view/admin-dashboard/discount-voucer/edit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Voucher — Sehela Admin",
  description: "Edit Voucher - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="voucher:update">
      <EditDiscountVoucherPage />
    </AdminPermissionGuard>
  );
}