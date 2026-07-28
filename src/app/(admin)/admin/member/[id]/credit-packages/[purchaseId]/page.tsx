"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { PackagePurchaseDetailPage } from "@/view/admin-dashboard/customer/package-purchase-detail";

export default function Page() {
  return (
    <AdminPermissionGuard permission="member:detail">
      <PackagePurchaseDetailPage />
    </AdminPermissionGuard>
  );
}
