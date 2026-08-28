import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { InstructorListPage } from "@/view/admin-dashboard/instructor/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instructors — Sehela Admin",
  description: "Instructors - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="instructor:view">
      <InstructorListPage />
    </AdminPermissionGuard>
  );
}