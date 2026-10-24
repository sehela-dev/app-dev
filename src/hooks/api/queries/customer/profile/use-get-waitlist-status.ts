import { getWaitlistStatus } from "@/api-req/customer-app";
import { useQuery } from "@tanstack/react-query";

export const useGetWaitlistStatus = (sessionId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ["user", "profile", "waitlist", sessionId],
    queryFn: () => getWaitlistStatus(sessionId!),
    enabled: !!sessionId && enabled,
    refetchOnWindowFocus: false,
  });
