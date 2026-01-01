import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TCreateVouchers, TGetVouchers } from "@/types/discount-voucher.interface";

export const getDiscounts: TGetVouchers = async ({ page, limit, status, search }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/vouchers`, {
    params: {
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
      status,
    },
  });
  return res.data;
};

export const createDiscount: TCreateVouchers = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/vouchers`, data);
  return res.data;
};
