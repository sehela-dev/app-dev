// getCustomerWallet
import { getCustomerWallet } from "@/api-req/customer";

import { useQuery } from "@tanstack/react-query";

interface IParams {
  user: string;
  session: string;
}

export const useGetCustomerWallet = (params: IParams) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", "customer-wallet", params],
    queryFn: () => getCustomerWallet(params),
    refetchOnWindowFocus: false,
    enabled: !!params.session && !!params.user,
  });
