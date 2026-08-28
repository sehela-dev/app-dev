import { AdminPermissionGuard } from "@/layout/admin/admin-permission-guard";
import { CreateProductPage } from "@/view/admin-dashboard/products/create";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Product — Sehela Admin",
  description: "Create Product - Sehela Admin Panel",
};


export default function Page() {
  return (
    <AdminPermissionGuard permission="products:create">
      <CreateProductPage />
    </AdminPermissionGuard>
  );
}