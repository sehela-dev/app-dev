import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { ProductListPage } from "@/view/admin-dashboard/products/list";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products — Sehela Admin",
  description: "Products - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="products:view">
      <ProductListPage />
    </AdminPermissionGuard>
  );
}