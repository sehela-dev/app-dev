import { getProductMovements } from "@/api-req";
import { IProductMovementsParams } from "@/types/product.interface";
import { useQuery } from "@tanstack/react-query";

export const useGetProductMovements = (id: string, params?: IProductMovementsParams) =>
  useQuery({
    queryKey: ["dashboard", "products", "movements", id, params],
    queryFn: () => getProductMovements(id, params),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
