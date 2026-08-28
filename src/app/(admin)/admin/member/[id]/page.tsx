import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CustomerDetailPage } from "@/view/admin-dashboard/customer/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Detail — Sehela Admin",
  description: "Member Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="member:detail">
      <CustomerDetailPage />
    </AdminPermissionGuard>
  );
}