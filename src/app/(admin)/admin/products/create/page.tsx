"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { ProductListPage } from "@/view/admin-dashboard/products/list";

export default function Page() {
  return (
    <AdminPermissionGuard permission="products:create">
      <ProductListPage />
    </AdminPermissionGuard>
  );
}
