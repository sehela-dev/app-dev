import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { OutstandingCreditView } from "@/view/report/outstanding-credit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outstanding Credits — Sehela Admin",
  description: "Outstanding Credits - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="outstanding:view">
      <OutstandingCreditView />
    </AdminPermissionGuard>
  );
}