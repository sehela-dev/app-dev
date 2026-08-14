import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  IReturnRentalPayload,
  IRentalListParams,
  TGetRentalDetail,
  TGetRentalList,
  TReturnRental,
} from "@/types/rental.interface";

export const getRentalList: TGetRentalList = async ({ page, limit, status, user_id }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/rentals`, {
    params: {
      page,
      page_size: limit,
      ...(status ? { status } : null),
      ...(user_id ? { user_id } : null),
    },
  });
  return res.data;
};

export const getRentalDetail: TGetRentalDetail = async (id) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/rentals/${id}`);
  return res.data;
};

export const returnRental: TReturnRental = async ({ id, payload, idempotencyKey }) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/admin/rentals/${id}/returns`, payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return res.data;
};

export type { IReturnRentalPayload, IRentalListParams };
