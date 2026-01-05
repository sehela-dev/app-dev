import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TApplyDiscount, TCreateVouchers, TEditVouchers, TGetDiscountDetail, TGetVouchers } from "@/types/discount-voucher.interface";

export const getDiscounts: TGetVouchers = async ({ page, limit, status, search, is_active }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/vouchers`, {
    params: {
      page,
      page_size: limit,
      ...(search ? { q: search } : null),
      ...(status ? { category: status } : null),
      ...(is_active ? { is_active: is_active } : null),
    },
  });
  return res.data;
};

export const createDiscount: TCreateVouchers = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/vouchers`, data);
  return res.data;
};
export const editDiscount: TEditVouchers = async ({ data, id }) => {
  const res = await axiosx(true).patch(`${MAIN_API_URL}/admin/vouchers/${id}`, data);
  return res.data;
};

export const getDiscountDetail: TGetDiscountDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/vouchers/${id}`);
  return res.data;
};

export const deleteDiscountDetail: TGetDiscountDetail = async (id) => {
  const res = await axiosx(true).delete(`${MAIN_API_URL}/admin/vouchers/${id}`);
  return res.data;
};

export const applyDiscountCode: TApplyDiscount = async (data) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/vouchers/validate/`, data);
  return res.data;
};
