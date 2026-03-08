"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditInstructorPage } from "@/view/admin-dashboard/instructor/edit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="instructor:update">
      <EditInstructorPage />
    </AdminPermissionGuard>
  );
}
