import { getProductList } from "@/api-req";
import { IProductListParams } from "@/types/product.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetProductList = (params: IProductListParams) =>
  useQuery({
    queryKey: ["dashboard", "products", params],
    queryFn: () => getProductList(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
