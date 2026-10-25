import { getAdminProductOrders, updateAdminProductOrder } from "@/api-req";
import { IAdminProductOrderUpdate, IAdminProductOrdersParams } from "@/types/customer-app/order.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAdminProductOrders = (params: IAdminProductOrdersParams) =>
  useQuery({
    queryKey: ["dashboard", "product-orders", params],
    queryFn: () => getAdminProductOrders(params),
    refetchOnWindowFocus: false,
  });

export const useUpdateAdminProductOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IAdminProductOrderUpdate }) => updateAdminProductOrder(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard", "product-orders"] }),
  });
};
