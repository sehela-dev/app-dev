import { getOutstandingBalances } from "@/api-req/admin-orders";

import { useQuery } from "@tanstack/react-query";

export const useGetOutstandingBalances = () =>
  useQuery({
    queryKey: ["dashboard", "orders", "outstanding-balances"],
    queryFn: getOutstandingBalances,
    refetchOnWindowFocus: false,
  });
