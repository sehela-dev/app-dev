import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { InstructorDetailPage } from "@/view/admin-dashboard/instructor/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instructor Detail — Sehela Admin",
  description: "Instructor Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="instructor:detail">
      <InstructorDetailPage />
    </AdminPermissionGuard>
  );
}