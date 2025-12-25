import { getCustomerDetail } from "@/api-req/customer";
import { useQuery } from "@tanstack/react-query";

export const useGetCustomerDetail = (params: string) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", "member-detail", "detail", params],
    queryFn: () => getCustomerDetail(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
