"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreditPackagePageView } from "@/view/admin-dashboard/credit-packages/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="credit_package:view">
      <CreditPackagePageView />
    </AdminPermissionGuard>
  );
}
