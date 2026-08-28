import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { LocationListView } from "@/view/admin-dashboard/location/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locations — Sehela Admin",
  description: "Locations - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="locations:view">
      <LocationListView />
    </AdminPermissionGuard>
  );
}