import { getProductCategoryList } from "@/api-req";
import { ICommonParams } from "@/types/general.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetProductCategories = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "products", "product-categories", params],
    queryFn: () => getProductCategoryList(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
