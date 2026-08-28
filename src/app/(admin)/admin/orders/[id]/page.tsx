import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { OrderReceiptPage } from "@/view/admin-dashboard/receipt";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Detail — Sehela Admin",
  description: "Order Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="order:view">
      <OrderReceiptPage />
    </AdminPermissionGuard>
  );
}