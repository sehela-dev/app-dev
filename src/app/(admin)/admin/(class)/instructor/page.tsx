"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { InstructorListPage } from "@/view/admin-dashboard/instructor/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="instructor:view">
      <InstructorListPage />
    </AdminPermissionGuard>
  );
}
