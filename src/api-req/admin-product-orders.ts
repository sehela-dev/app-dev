import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  IAdminProductOrderUpdate,
  IAdminProductOrderUpdateResponse,
  IAdminProductOrdersParams,
  IAdminProductOrdersResponse,
} from "@/types/customer-app/order.interface";

export const getAdminProductOrders = async (params: IAdminProductOrdersParams = {}): Promise<IAdminProductOrdersResponse> => {
  const { success, data, pagination } = (
    await axiosx(true).get(`${MAIN_API_URL}/admin/orders`, {
      params: {
        page: params.page,
        page_size: params.page_size,
        ...(params.fulfillment_status ? { fulfillment_status: params.fulfillment_status } : null),
      },
    })
  ).data;
  return { success, data, pagination };
};

export const updateAdminProductOrder = async (
  id: string,
  payload: IAdminProductOrderUpdate,
): Promise<IAdminProductOrderUpdateResponse> => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/orders/${id}`, payload);
  return res.data;
};
