import { getDetailOrder } from "@/api-req/admin-orders";

import { useQuery } from "@tanstack/react-query";

export const useGetOrderDetail = (id: string) =>
  useQuery({
    queryKey: ["dashboard", "orders", "order-detail", id],
    queryFn: () => getDetailOrder(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
