import {
  completeMemberOrder,
  createAddress,
  createProductOrder,
  deleteAddress,
  getAddresses,
  getMemberOrder,
  getMemberOrders,
  updateAddress,
} from "@/api-req/customer-app";
import { IAddressPayload, ICreateOrderPayload, IMemberOrdersParams } from "@/types/customer-app/order.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAddresses = () =>
  useQuery({
    queryKey: ["customer", "profile", "addresses"],
    queryFn: getAddresses,
    refetchOnWindowFocus: false,
  });

export const useCreateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IAddressPayload) => createAddress(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer", "profile", "addresses"] }),
  });
};

export const useUpdateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IAddressPayload> }) => updateAddress(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer", "profile", "addresses"] }),
  });
};

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer", "profile", "addresses"] }),
  });
};

export const useCreateProductOrder = () => useMutation({ mutationFn: (body: ICreateOrderPayload) => createProductOrder(body) });

export const useGetMemberOrders = (params: IMemberOrdersParams) =>
  useQuery({
    queryKey: ["customer", "profile", "orders", params],
    queryFn: () => getMemberOrders(params),
    refetchOnWindowFocus: false,
  });

export const useGetMemberOrder = (id: string | null) =>
  useQuery({
    queryKey: ["customer", "profile", "orders", "detail", id],
    queryFn: () => getMemberOrder(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

export const useCompleteMemberOrder = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => completeMemberOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "profile", "orders"] });
    },
  });
};
