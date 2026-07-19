"use client";
import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateProductPage } from "@/view/admin-dashboard/products/create";

export default function Page() {
  return (
    <AdminPermissionGuard permission="products:create">
      <CreateProductPage />
    </AdminPermissionGuard>
  );
}
