import { getSessionWaitlist } from "@/api-req/class-session";

import { useQuery } from "@tanstack/react-query";

export const useGetSessionWaitlist = (id: string) =>
  useQuery({
    queryKey: ["dashboard", "orders", "session", "waitlist", id],
    queryFn: () => getSessionWaitlist(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
