import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditLocationPage } from "@/view/admin-dashboard/location/edit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Location — Sehela Admin",
  description: "Edit Location - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="locations:update">
      <EditLocationPage />
    </AdminPermissionGuard>
  );
}