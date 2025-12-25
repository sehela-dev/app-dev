import { getCustomers } from "@/api-req/customer";
import { ICommonParams } from "@/types/general.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetCustomers = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", params],
    queryFn: () => getCustomers(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
