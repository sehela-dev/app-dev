import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { TeacherReportView } from "@/view/report/teacher";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Report — Sehela Admin",
  description: "Teacher payroll report - Sehela Admin Panel",
};

export default function Page() {
  return (
    <AdminPermissionGuard permission="reports">
      <TeacherReportView />
    </AdminPermissionGuard>
  );
}
