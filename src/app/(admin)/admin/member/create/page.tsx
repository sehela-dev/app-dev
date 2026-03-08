"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateMemberPage } from "@/view/admin-dashboard/customer/add";

export default function Page() {
  return (
    <AdminPermissionGuard permission="member:create">
      <CreateMemberPage />
    </AdminPermissionGuard>
  );
}
