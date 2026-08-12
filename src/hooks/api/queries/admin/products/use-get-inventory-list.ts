import { getInventoryList } from "@/api-req";
import { IInventoryParams } from "@/types/product.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetInventoryList = (params: IInventoryParams) =>
  useQuery({
    queryKey: ["dashboard", "products", "inventory", "snapshot", params],
    queryFn: () => getInventoryList(params),
    refetchOnWindowFocus: false,
  });
