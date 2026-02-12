import { getCustomerActivity } from "@/api-req/customer";
import { ICustomerActivityParams } from "@/types/customers.interface";

import { useQuery } from "@tanstack/react-query";

export const useGetCustomerActivity = (params: ICustomerActivityParams) =>
  useQuery({
    queryKey: ["dashboard", "customers", "member", "member-detail", "detail", "member-activity", params],
    queryFn: () => getCustomerActivity(params),
    refetchOnWindowFocus: false,
    enabled: !!params?.id,
  });
