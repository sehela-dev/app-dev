import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { SessionListPage } from "@/view/admin-dashboard/session/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="session:view">
      <SessionListPage />
    </AdminPermissionGuard>
  );
}
