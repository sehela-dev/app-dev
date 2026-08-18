import { getRefundDetail } from "@/api-req/refund";
import { useQuery } from "@tanstack/react-query";

export const useGetRefundDetail = (id: string) =>
  useQuery({
    queryKey: ["admin", "refunds", "detail", id],
    queryFn: () => getRefundDetail(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });