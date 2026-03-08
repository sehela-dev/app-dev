"use client";

import { useAdminPermission } from "@/hooks/use-role-access";

export function AdminPermissionGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { can } = useAdminPermission();

  if (!can(permission)) {
    return <div>Forbidden</div>;
  }

  return children;
}
