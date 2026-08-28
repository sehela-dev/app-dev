import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AddTransactionPage } from "@/view/admin-dashboard/add-transaction";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Transaction — Sehela Admin",
  description: "Add Transaction - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="order:create">
      <AddTransactionPage />
    </AdminPermissionGuard>
  );
}