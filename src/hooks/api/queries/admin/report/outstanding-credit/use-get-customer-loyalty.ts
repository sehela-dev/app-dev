import { getCustomerLoyalty } from "@/api-req/report";

import { ICustomerLoyaltyParams } from "@/types/report.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetCustomerLoyalty = (params: ICustomerLoyaltyParams) =>
  useQuery({
    queryKey: ["dashboard", "report", "customer-loyalty", params],
    queryFn: () => getCustomerLoyalty(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
