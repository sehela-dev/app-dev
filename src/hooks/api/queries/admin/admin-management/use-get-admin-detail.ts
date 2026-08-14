import { getAdminDetail } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetAdminDetail = (id: string) =>
  useQuery({
    queryKey: ["dashboard", "admins", "admin-detail", id],
    queryFn: () => getAdminDetail(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
