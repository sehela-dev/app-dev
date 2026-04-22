import { useAuthAdmin } from "@/context/admin/admin-context";
import { PERMISSIONS_ROLE } from "@/lib/role-access";

export const useAdminPermission = () => {
  const { user } = useAuthAdmin();
  console.log(user);

  const role = user?.profile?.role;

  const permissions = role ? PERMISSIONS_ROLE[role as keyof typeof PERMISSIONS_ROLE] : [];

  const can = (permission: string) => {
    return permissions.includes(permission);
  };
  const isManager = role === "manager";

  return { can, isManager };
};
