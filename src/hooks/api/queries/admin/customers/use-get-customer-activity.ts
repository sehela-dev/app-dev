import { getCustomerActivity, getCustomerTrx, getHistoricalPackagePurchases } from "@/api-req/customer";
import { ICustomerActivityParams, IHistoricalPackagePurchasesParams } from "@/types/customers.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetCustomerActivity = (params: ICustomerActivityParams, isActive: boolean) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", "member-detail", "detail", "member-activity", params],
    queryFn: () => getCustomerActivity(params),
    refetchOnWindowFocus: false,
    enabled: isActive && !!params.id,
  });

export const useGetCustomerTrx = (params: ICustomerActivityParams, isActive: boolean) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", "member-detail", "detail", "member-transactions", params],
    queryFn: () => getCustomerTrx(params),
    refetchOnWindowFocus: false,
    enabled: isActive && !!params.id,
  });

export const useGetHistoricalPackagePurchases = (params: IHistoricalPackagePurchasesParams, isActive: boolean) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", "member-detail", "detail", "historical-package-purchases", params.userId, params.page, params.pageSize],
    queryFn: () => getHistoricalPackagePurchases(params),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: isActive && !!params.userId,
  });
