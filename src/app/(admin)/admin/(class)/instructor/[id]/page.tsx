"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { InstructorDetailPage } from "@/view/admin-dashboard/instructor/detail";

export default function Page() {
  return (
    <AdminPermissionGuard permission="instructor:detail">
      <InstructorDetailPage />
    </AdminPermissionGuard>
  );
}
