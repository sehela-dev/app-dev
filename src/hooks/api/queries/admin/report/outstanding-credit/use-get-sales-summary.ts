import { getSalesSummary } from "@/api-req/report";

import { ISalesSummaryParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetSalesSummary = (params: ISalesSummaryParams) =>
  useQuery({
    queryKey: ["dashboard", "report", "sales-summary", params],
    queryFn: () => getSalesSummary(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
