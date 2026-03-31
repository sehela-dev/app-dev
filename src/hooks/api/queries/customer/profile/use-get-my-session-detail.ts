import { getMySessionDetail } from "@/api-req/customer-app";

import { useQuery } from "@tanstack/react-query";

export const useGetMySessionDetail = (params: string) =>
  useQuery({
    queryKey: ["user", "profile", "my-session", "my-session-detail", params],
    queryFn: () => getMySessionDetail(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
