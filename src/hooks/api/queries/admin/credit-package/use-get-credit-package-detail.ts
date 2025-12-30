import { getCreditPackage } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetCreditPackageDetail = (params: string) =>
  useQuery({
    queryKey: ["dashboard", "credit-package", "credit", "credit-detail", params],
    queryFn: () => getCreditPackage(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
