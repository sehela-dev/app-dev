import { getRefunds } from "@/api-req/refund";
import { IRefundListParams } from "@/types/refund.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetRefunds = (params: IRefundListParams) =>
  useQuery({
    queryKey: ["admin", "refunds", params],
    queryFn: () => getRefunds(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });