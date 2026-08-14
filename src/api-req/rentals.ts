import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  IReturnRentalPayload,
  IRentalListParams,
  TGetRentalDetail,
  TGetRentalList,
  TReturnRental,
} from "@/types/rental.interface";

export const getRentalList: TGetRentalList = async ({ page, limit, status, location_id, customer, payment_id, created_from, created_to }) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/admin/rentals`, {
    params: {
      page,
      page_size: limit,
      ...(status ? { status } : null),
      ...(location_id ? { location_id } : null),
      ...(customer ? { customer } : null),
      ...(payment_id ? { payment_id } : null),
      ...(created_from ? { created_from } : null),
      ...(created_to ? { created_to } : null),
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
