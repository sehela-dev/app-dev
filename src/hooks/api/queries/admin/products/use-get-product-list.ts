import { getProductList } from "@/api-req";
import { ICommonParams } from "@/types/general.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetProductList = (params: ICommonParams) =>
  useQuery({
    queryKey: ["dashboard", "products", params],
    queryFn: () => getProductList(params),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
