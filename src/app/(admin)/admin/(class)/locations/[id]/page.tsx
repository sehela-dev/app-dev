import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { LocationDetailPage } from "@/view/admin-dashboard/location/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location Detail — Sehela Admin",
  description: "Location Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="locations:detail">
      <LocationDetailPage />
    </AdminPermissionGuard>
  );
}