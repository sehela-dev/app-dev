import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  IAddress,
  IAddressPayload,
  ICreateOrderPayload,
  ICreateOrderResponse,
  IMemberOrder,
  IMemberOrdersParams,
  IMemberOrdersResponse,
} from "@/types/customer-app/order.interface";

export const getAddresses = async (): Promise<IAddress[]> => {
  const { data } = (await axiosx(true).get(`${MAIN_API_URL}/profile/addresses`)).data;
  return data ?? [];
};

export const createAddress = async (body: IAddressPayload): Promise<IAddress> => {
  const { data } = (await axiosx(true).post(`${MAIN_API_URL}/profile/addresses`, body)).data;
  return data;
};

export const updateAddress = async (id: string, body: Partial<IAddressPayload>): Promise<IAddress> => {
  const { data } = (await axiosx(true).patch(`${MAIN_API_URL}/profile/addresses/${id}`, body)).data;
  return data;
};

export const deleteAddress = async (id: string): Promise<{ deleted: boolean; new_default_id: string | null }> => {
  const { data } = (await axiosx(true).delete(`${MAIN_API_URL}/profile/addresses/${id}`)).data;
  return data;
};

export const createProductOrder = async (body: ICreateOrderPayload): Promise<ICreateOrderResponse> => {
  const { data } = (await axiosx(true).post(`${MAIN_API_URL}/profile/orders`, body)).data;
  return data;
};

export const getMemberOrders = async (params: IMemberOrdersParams = {}): Promise<IMemberOrdersResponse> => {
  const { success, data, pagination } = (
    await axiosx(true).get(`${MAIN_API_URL}/profile/orders`, {
      params: {
        page: params.page,
        page_size: params.page_size,
        ...(params.status ? { status: params.status } : null),
      },
    })
  ).data;
  return { success, data, pagination };
};

export const getMemberOrder = async (id: string): Promise<IMemberOrder> => {
  const { data } = (await axiosx(true).get(`${MAIN_API_URL}/profile/orders/${id}`)).data;
  return data;
};

export const completeMemberOrder = async (id: string): Promise<{ id: string; fulfillment_status: string }> => {
  const { data } = (await axiosx(true).patch(`${MAIN_API_URL}/profile/orders/${id}`, { fulfillment_status: "completed" })).data;
  return data;
};

// Extract the BE error envelope so callers can render code-specific copy.
export const getOrderApiError = (error: unknown): { code?: string; message?: string; details?: Record<string, string[]> } => {
  const err = error as { response?: { data?: { error?: { code?: string; message?: string; details?: Record<string, string[]> } } } };
  return err?.response?.data?.error ?? {};
};
