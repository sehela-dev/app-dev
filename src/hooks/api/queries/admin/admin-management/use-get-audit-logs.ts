import { getAuditLogs } from "@/api-req";
import { IAuditLogParams } from "@/types/admin-management.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetAuditLogs = (params: IAuditLogParams) =>
  useQuery({
    queryKey: ["dashboard", "audit-logs", params],
    queryFn: () => getAuditLogs(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
