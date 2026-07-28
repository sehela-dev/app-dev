"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { ProductDetailView } from "@/view/admin-dashboard/products/detail";

export default function Page() {
  return (
    <AdminPermissionGuard permission="products:view">
      <ProductDetailView />
    </AdminPermissionGuard>
  );
}
