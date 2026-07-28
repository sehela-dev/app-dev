import { getProductDetail } from "@/api-req";

import { useQuery } from "@tanstack/react-query";

export const useGetProductDetail = (params: string) =>
  useQuery({
    queryKey: ["dashboard", "products", "product-detail", "variant", params],
    queryFn: () => getProductDetail(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
