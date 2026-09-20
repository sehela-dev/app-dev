import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CashFlowView } from "@/view/report/cash-flow";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cash Flow — Sehela Admin",
  description: "Cash Flow - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="cash-flow:view">
      <CashFlowView />
    </AdminPermissionGuard>
  );
}