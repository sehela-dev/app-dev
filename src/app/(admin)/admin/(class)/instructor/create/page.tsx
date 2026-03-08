"use client";

import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateInstructorPage } from "@/view/admin-dashboard/instructor/create";

export default function Page() {
  return (
    <AdminPermissionGuard permission="instructor:create">
      <CreateInstructorPage />
    </AdminPermissionGuard>
  );
}
