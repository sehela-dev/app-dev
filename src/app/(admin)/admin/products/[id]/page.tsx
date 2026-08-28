import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { ProductDetailView } from "@/view/admin-dashboard/products/detail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Detail — Sehela Admin",
  description: "Product Detail - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="products:view">
      <ProductDetailView />
    </AdminPermissionGuard>
  );
}