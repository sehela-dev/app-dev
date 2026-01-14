import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { ICommonParams } from "@/types/general.interface";
import { TBookingsSession, TCreateManualOrder, TOrderDetail, TOrderList, TThirdPartyApp } from "@/types/orders.interface";
import { TAddNewGuest } from "@/types/user.type";

export const getOrders: TOrderList = async ({ page, limit, search, payment_method, status, startDate, endDate }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/transactions`, {
    params: {
      page,
      page_size: limit,
      ...(startDate ? { start_date: startDate } : null),
      ...(endDate ? { end_date: endDate } : null),
      ...(search ? { q: search } : null),
      ...(payment_method ? { payment_method } : null),
      ...(status ? { status } : null),
      ...(status ? { status } : null),
    },
  });
  return res.data;
};

export const getDetailOrder: TOrderDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/transactions/${id}`);
  return res.data;
};

export const createNewGuest: TAddNewGuest = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/create-student`, data);
  return res.data;
};

export const createNewManualOrder: TCreateManualOrder = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/transactions`, data);
  return res.data;
};

export const getProductOrder = async ({ page, limit, search }: ICommonParams) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/products`, {
    params: {
      page,
      page_size: limit,
      q: search,
    },
  });

  return res.data;
};

export const adminBooking: TBookingsSession = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/bookings`, data);
  return res.data;
};

export const getThirdParyApp: TThirdPartyApp = async () => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/third-parties`);
  return res.data;
};
