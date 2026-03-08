"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { OutstandingCreditView } from "@/view/report/outstanding-credit";

export default function Page() {
  return (
    <AdminPermissionGuard permission="outstanding:view">
      <OutstandingCreditView />
    </AdminPermissionGuard>
  );
}
