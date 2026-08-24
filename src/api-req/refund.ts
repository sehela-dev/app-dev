import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TGetRefundDetail, TGetRefunds, TReviewRefund } from "@/types/refund.interface";

export const getRefunds: TGetRefunds = async ({ status = "all", movement_type = "all", page = 1, limit = 20 }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/refunds`, {
    params: {
      ...(status && status !== "all" ? { status } : null),
      ...(movement_type && movement_type !== "all" ? { movement_type } : null),
      page,
      page_size: limit,
    },
  });
  return res.data;
};

export const getRefundDetail: TGetRefundDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/refunds/${id}`);
  return res.data;
};

export const approveRefund: TReviewRefund = async ({ id, note }) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/refunds/${id}/approve`, {
    ...(note ? { note } : null),
  });
  return res.data;
};

export const rejectRefund: TReviewRefund = async ({ id, note }) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/refunds/${id}/reject`, {
    ...(note ? { note } : null),
  });
  return res.data;
};