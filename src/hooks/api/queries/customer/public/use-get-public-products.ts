import { getPublicProduct, getPublicProducts } from "@/api-req/customer-app";
import { IPublicProductsParams } from "@/types/customer-app/product.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetPublicProducts = (params: IPublicProductsParams = {}) =>
  useQuery({
    queryKey: ["customer", "public", "products", params],
    queryFn: () => getPublicProducts(params),
    refetchOnWindowFocus: false,
  });

export const useGetPublicProductDetail = (id: string | null) =>
  useQuery({
    queryKey: ["customer", "public", "products", "detail", id],
    queryFn: () => getPublicProduct(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
    retry: 1,
  });
