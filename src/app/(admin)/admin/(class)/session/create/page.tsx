"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateSessionPageView } from "@/view/admin-dashboard/session/add-session";

export default function Page() {
  return (
    <AdminPermissionGuard permission="session:create">
      <CreateSessionPageView />;
    </AdminPermissionGuard>
  );
}
