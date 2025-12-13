import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TOrderDetail, TOrderList } from "@/types/orders.interface";

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
