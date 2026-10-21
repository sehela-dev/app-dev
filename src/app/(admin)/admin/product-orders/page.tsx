import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { ProductOrdersPageView } from "@/view/admin-dashboard/product-orders";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Orders — Sehela Admin",
  description: "Product Orders - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="order:view">
      <ProductOrdersPageView />
    </AdminPermissionGuard>
  );
}
