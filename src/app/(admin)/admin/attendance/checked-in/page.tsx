import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CheckedInPage } from "@/view/admin-dashboard/attendance/checked-in";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checked In — Sehela Admin",
  description: "Scan QR to check in attendance - Sehela Admin Panel",
};

export default function Page() {
  return (
    <AdminPermissionGuard permission="session:view">
      <CheckedInPage />
    </AdminPermissionGuard>
  );
}
