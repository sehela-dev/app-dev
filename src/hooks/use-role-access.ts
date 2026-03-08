import { useAuthAdmin } from "@/context/admin/admin-context";
import { PERMISSIONS_ROLE } from "@/lib/role-access";

export const useAdminPermission = () => {
  const { user } = useAuthAdmin();

  const role = user?.profile?.role;

  const permissions = role ? PERMISSIONS_ROLE[role as keyof typeof PERMISSIONS_ROLE] : [];

  const can = (permission: string) => {
    return permissions.includes(permission);
  };

  return { can };
};
