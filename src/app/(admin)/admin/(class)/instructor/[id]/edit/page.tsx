import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditInstructorPage } from "@/view/admin-dashboard/instructor/edit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Instructor — Sehela Admin",
  description: "Edit Instructor - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="instructor:update">
      <EditInstructorPage />
    </AdminPermissionGuard>
  );
}