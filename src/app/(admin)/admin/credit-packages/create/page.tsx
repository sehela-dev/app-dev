import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { AddCreditPacakgesPage } from "@/view/admin-dashboard/credit-packages/add";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Credit Package — Sehela Admin",
  description: "Create Credit Package - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="credit_package:create">
      <AddCreditPacakgesPage />
    </AdminPermissionGuard>
  );
}