import { getAdmins } from "@/api-req";
import { IAdminListParams } from "@/types/admin-management.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetAdmins = (params: IAdminListParams) =>
  useQuery({
    queryKey: ["dashboard", "admins", params],
    queryFn: () => getAdmins(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
