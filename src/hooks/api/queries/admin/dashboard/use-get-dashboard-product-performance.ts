import { getDashboardProductPerformance } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetDashboardProductPerformance = () =>
  useQuery({
    queryKey: ["dashboard", "overview", "charts", "p", "session-performance"],
    queryFn: getDashboardProductPerformance,
    refetchOnWindowFocus: false,
  });
