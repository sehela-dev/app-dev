import { getDashboardOverview } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetDashboardOverview = () =>
  useQuery({
    queryKey: ["dashboard", "overview", "charts"],
    queryFn: getDashboardOverview,
    refetchOnWindowFocus: false,
  });
