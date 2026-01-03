import { getDiscountDetail } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetDiscountVoucherDetail = (params: string) =>
  useQuery({
    queryKey: ["dashboard", "discount-vouchers", "vouchers", "discount", "detail", params],
    queryFn: () => getDiscountDetail(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
