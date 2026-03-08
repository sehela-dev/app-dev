"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { EditMemberPage } from "@/view/admin-dashboard/customer/edit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="member:update">
      <EditMemberPage />
    </AdminPermissionGuard>
  );
}
