import { getInventoryLocations } from "@/api-req";
import { IParamsInventory } from "@/types/product.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetInventoryLocations = (params?: IParamsInventory) =>
  useQuery({
    queryKey: ["dashboard", "products", "product-categories", params],
    queryFn: () => getInventoryLocations(params),
    refetchOnWindowFocus: false,
  });
