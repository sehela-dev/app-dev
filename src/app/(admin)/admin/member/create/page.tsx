import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateMemberPage } from "@/view/admin-dashboard/customer/add";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Member — Sehela Admin",
  description: "Create Member - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="member:create">
      <CreateMemberPage />
    </AdminPermissionGuard>
  );
}