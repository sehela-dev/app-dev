import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateDiscountVoucherPage } from "@/view/admin-dashboard/discount-voucer/add";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Voucher — Sehela Admin",
  description: "Create Voucher - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="voucher:create">
      <CreateDiscountVoucherPage />
    </AdminPermissionGuard>
  );
}