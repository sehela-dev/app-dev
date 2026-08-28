import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateLocationPage } from "@/view/admin-dashboard/location/create";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Location — Sehela Admin",
  description: "Create Location - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="locations:create">
      <CreateLocationPage />
    </AdminPermissionGuard>
  );
}