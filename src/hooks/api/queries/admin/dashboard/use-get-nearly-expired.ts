import { getNearlyExpiredCredits } from "@/api-req";
import { IParamsNearlyExpiredCredit } from "@/types/dashboard.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetDashboardNearlyExpired = ({ page, within_days, limit }: IParamsNearlyExpiredCredit) =>
  useQuery({
    queryKey: ["dashboard", "nearly-expired", "credits", within_days, page, limit],
    queryFn: () => getNearlyExpiredCredits({ page, limit, within_days }),
    refetchOnWindowFocus: false,
  });
