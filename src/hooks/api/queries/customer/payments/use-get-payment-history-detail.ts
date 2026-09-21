import { getPaymentHistoryDetail } from "@/api-req/customer-app";
import { useQuery } from "@tanstack/react-query";

// History detail — :ref = payment uuid, readable order_id, or PKG-… (own payment only, else 404).
export const useGetPaymentHistoryDetail = (ref: string | null) =>
  useQuery({
    queryKey: ["user", "payments", "history", "detail", ref],
    queryFn: () => getPaymentHistoryDetail(ref!),
    enabled: !!ref,
    refetchOnWindowFocus: false,
  });
