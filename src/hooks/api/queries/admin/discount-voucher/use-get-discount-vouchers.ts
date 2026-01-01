import { getDiscounts } from "@/api-req";
import { ICommonParams } from "@/types/general.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetDiscountVouchers = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "discount-vouchers", "vouchers", "discount", params],
    queryFn: () => getDiscounts(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
