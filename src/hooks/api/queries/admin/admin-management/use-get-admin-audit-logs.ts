import { getAdminAuditLogs } from "@/api-req";
import { IAuditLogParams } from "@/types/admin-management.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetAdminAuditLogs = (params: IAuditLogParams) =>
  useQuery({
    queryKey: ["dashboard", "admins", "audit-logs", params],
    queryFn: () => getAdminAuditLogs(params),
    refetchOnWindowFocus: false,
    enabled: !!params?.id,
  });
