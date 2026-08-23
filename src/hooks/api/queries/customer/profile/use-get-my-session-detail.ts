import { getMySessionDetail } from "@/api-req/customer-app";

import { useQuery } from "@tanstack/react-query";

export const useGetMySessionDetail = (params: string | undefined) =>
  useQuery({
    queryKey: ["user", "profile", "my-session", "my-session-detail", params],
    queryFn: () => getMySessionDetail(params!),
    enabled: !!params,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
