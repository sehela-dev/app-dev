import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { ClassListView } from "@/view/admin-dashboard/class/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Class Categories — Sehela Admin",
  description: "Class Categories - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="class:view">
      <ClassListView />
    </AdminPermissionGuard>
  );
}