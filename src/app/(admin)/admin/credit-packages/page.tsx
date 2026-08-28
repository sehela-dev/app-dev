import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreditPackagePageView } from "@/view/admin-dashboard/credit-packages/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Packages — Sehela Admin",
  description: "Credit Packages - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="credit_package:view">
      <CreditPackagePageView />
    </AdminPermissionGuard>
  );
}