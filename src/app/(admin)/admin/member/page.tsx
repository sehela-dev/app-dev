import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CustomersPage } from "@/view/admin-dashboard/customer/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members — Sehela Admin",
  description: "Members - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="member:view">
      <CustomersPage />
    </AdminPermissionGuard>
  );
}