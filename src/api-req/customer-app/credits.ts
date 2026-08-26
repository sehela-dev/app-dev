import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { TGetCreditLedger } from "@/types/customer-app/credit-ledger.interface";
import { TMyCreditResponse } from "@/types/customer-app/my-credit.interface";

export const getMyCredits: TMyCreditResponse = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/credit-packages/my-packages`, {
    params: {
      ...(params?.is_expired !== undefined ? { is_expired: params.is_expired } : {}),
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.page_size || params?.limit ? { page_size: params.page_size ?? params.limit } : {}),
    },
  });
  return res.data;
};

export const getCreditLedger: TGetCreditLedger = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/profile/my-credit-history`, {
    params: {
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.page_size ? { page_size: params.page_size } : {}),
      ...(params?.type && params.type !== "all" ? { type: params.type } : {}),
    },
  });
  // supabase functions returns { success, data, pagination, summary } — normalize to IResponseData
  const d = res.data as { success?: boolean; data: unknown; pagination?: unknown; summary?: unknown; statusCode?: number; message?: string };
  if (d.success !== undefined) {
    return {
      statusCode: d.statusCode ?? 200,
      message: d.message ?? "ok",
      data: d.data as never,
      pagination: d.pagination as never,
      summary: d.summary as never,
    } as never;
  }
  return res.data;
};
