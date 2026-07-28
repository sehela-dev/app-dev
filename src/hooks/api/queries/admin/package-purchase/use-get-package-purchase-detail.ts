import { getPackagePurchaseDetail } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const packagePurchaseDetailQueryKey = (id: string) => ["admin", "package-purchase", "detail", id] as const;

export const useGetPackagePurchaseDetail = (id: string) =>
  useQuery({
    queryKey: packagePurchaseDetailQueryKey(id),
    queryFn: () => getPackagePurchaseDetail(id),
    refetchOnWindowFocus: false,
    enabled: Boolean(id),
  });
