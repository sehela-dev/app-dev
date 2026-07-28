import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import {
  TAdjustPackagePurchaseCredits,
  TGetPackagePurchaseDetail,
  TOverridePackagePurchaseExpiry,
} from "@/types/package-purchase.interface";

const packagePurchasePath = (id: string) => `${MAIN_API_URL}/admin/package-purchases/${id}`;

export const getPackagePurchaseDetail: TGetPackagePurchaseDetail = async (id) => {
  const res = await axiosx(true).get(packagePurchasePath(id));
  return res.data;
};

export const adjustPackagePurchaseCredits: TAdjustPackagePurchaseCredits = async ({ id, data, idempotencyKey }) => {
  const res = await axiosx(true).post(`${packagePurchasePath(id)}/credit-adjustments`, data, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return res.data;
};

export const overridePackagePurchaseExpiry: TOverridePackagePurchaseExpiry = async ({ id, data, idempotencyKey }) => {
  const res = await axiosx(true).post(`${packagePurchasePath(id)}/expiry-overrides`, data, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return res.data;
};
