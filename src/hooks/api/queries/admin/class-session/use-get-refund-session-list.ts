import { cancelSessionPreview } from "@/api-req/class-session";

import { useQuery } from "@tanstack/react-query";

export const useGetRefundSessionList = (params: string, enabled = true) =>
  useQuery({
    queryKey: ["dashboard", "session", "session-refund", "sessions", params],
    queryFn: () => cancelSessionPreview(params),
    refetchOnWindowFocus: false,
    enabled: !!params && enabled,
  });
