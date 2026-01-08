import { getDashboardSessionPerformance } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetDashboardSessionPerformance = () =>
  useQuery({
    queryKey: ["dashboard", "overview", "charts", "sessions", "session-performance"],
    queryFn: getDashboardSessionPerformance,
    refetchOnWindowFocus: false,
  });
