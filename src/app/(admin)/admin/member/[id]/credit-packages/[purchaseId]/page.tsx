import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { PackagePurchaseDetailPage } from "@/view/admin-dashboard/customer/package-purchase-detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Package Purchase Detail — Sehela Admin",
  description: "Package Purchase Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="member:detail">
      <PackagePurchaseDetailPage />
    </AdminPermissionGuard>
  );
}