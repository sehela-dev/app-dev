import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditCreditPacakgesPage } from "@/view/admin-dashboard/credit-packages/edit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Credit Package — Sehela Admin",
  description: "Edit Credit Package - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="credit_package:update">
      <EditCreditPacakgesPage />
    </AdminPermissionGuard>
  );
}