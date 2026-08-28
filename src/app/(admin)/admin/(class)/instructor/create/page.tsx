import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateInstructorPage } from "@/view/admin-dashboard/instructor/create";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Instructor — Sehela Admin",
  description: "Create Instructor - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="instructor:create">
      <CreateInstructorPage />
    </AdminPermissionGuard>
  );
}