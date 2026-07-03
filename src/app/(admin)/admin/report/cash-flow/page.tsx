"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CashFlowView } from "@/view/report/cash-flow";

export default function Page() {
  return (
    <AdminPermissionGuard permission="cash-flow:view">
      <CashFlowView />
    </AdminPermissionGuard>
  );
}
