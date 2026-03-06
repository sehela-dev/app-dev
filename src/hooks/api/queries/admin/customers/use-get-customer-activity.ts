import { getCustomerActivity, getCustomerTrx } from "@/api-req/customer";
import { ICustomerActivityParams } from "@/types/customers.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetCustomerActivity = (params: ICustomerActivityParams) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", "member-detail", "detail", "member-activity", params],
    queryFn: () => getCustomerActivity(params),
    refetchOnWindowFocus: false,
    enabled: !!params?.id,
  });

export const useGetCustomerTrx = (params: ICustomerActivityParams, tabs: string) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", "member-detail", "detail", "member-activity", params],
    queryFn: () => getCustomerTrx(params),
    refetchOnWindowFocus: false,
    enabled: tabs === "trx",
  });
