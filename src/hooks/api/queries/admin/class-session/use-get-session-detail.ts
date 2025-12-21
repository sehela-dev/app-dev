import { getSessionDetail } from "@/api-req/class-session";

import { useQuery } from "@tanstack/react-query";

export const useGetSessionDetail = (id: string) =>
  useQuery({
    queryKey: ["dashboard", "orders", "session", "session-detail", id],
    queryFn: () => getSessionDetail(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
