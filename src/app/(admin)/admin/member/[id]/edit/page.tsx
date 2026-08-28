import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditMemberPage } from "@/view/admin-dashboard/customer/edit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Member — Sehela Admin",
  description: "Edit Member - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="member:update">
      <EditMemberPage />
    </AdminPermissionGuard>
  );
}