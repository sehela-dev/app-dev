import { axiosx } from "@/lib/axiosx";
import { MAIN_API_URL } from "@/lib/config";
import { IResponseData } from "@/lib/config";

// ----------------------------------------------------------------------
// GET /payments/status/:order_id
// ----------------------------------------------------------------------

export interface IPaymentStatus {
  order_id: string;
  payment_id?: string;
  booking_id?: string;
  transaction_status: string;
  payment_type?: string;
  gross_amount?: number;
  status_message?: string;
}

export type TGetPaymentStatus = (orderId: string) => Promise<IResponseData<IPaymentStatus>>;

export const getPaymentStatus: TGetPaymentStatus = async (orderId) => {
  const clean = orderId.replace(/^#+/, "").trim();
  const res = await axiosx(true).get(`${MAIN_API_URL}/payments/status/${encodeURIComponent(clean)}`);
  return res.data;
};

// ----------------------------------------------------------------------
// POST /payments/initiate (A3) — member JWT required; redirect to snap_redirect_url
// ----------------------------------------------------------------------

export interface IInitiatePackagePurchaseRequest {
  package_id: string;
  share_with_user_id?: string | null;
}

export interface IInitiatePackagePurchaseResponse {
  payment_id: string;
  package_purchase_id: string;
  order_id: string;
  amount_idr: number;
  snap_token: string;
  snap_redirect_url: string;
}

export type TInitiatePackagePurchase = (
  body: IInitiatePackagePurchaseRequest,
) => Promise<IResponseData<IInitiatePackagePurchaseResponse>>;

export const initiatePackagePurchase: TInitiatePackagePurchase = async (body) => {
  const res = await axiosx(true).post(`${MAIN_API_URL}/payments/initiate`, body);
  return res.data;
};

// ----------------------------------------------------------------------
// GET /payments/history (A4) — member transaction history list
// ----------------------------------------------------------------------

export interface IPackagePaymentHistoryItem {
  payment_id?: string;
  order_id?: string;
  package_id?: string;
  payable_type?: string;
  payable_id?: string;
  package_name?: string;
  package_credits?: number;
  status?: string;
  gross_amount_idr?: number;
  provider_txn_id?: string | null;
  created_at?: string;
  updated_at?: string;
  snap_token?: string;
  session_name?: string | null;
  class_name?: string | null;
  // BE contract (requested): pending rows carry these so FE can resume + count down
  // without re-initiating (each initiate creates a new payment row).
  expires_at?: string;
  snap_redirect_url?: string;
  [key: string]: unknown;
}

export type TGetPaymentHistory = (params?: {
  page?: number;
  page_size?: number;
}) => Promise<IResponseData<IPackagePaymentHistoryItem[]>>;

export const getPaymentHistory: TGetPaymentHistory = async (params) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/payments/history`, {
    params: { page: params?.page ?? 1, page_size: params?.page_size ?? 20 },
  });
  return res.data;
};

// ----------------------------------------------------------------------
// GET /payments/history/:ref — history detail (:ref = payment uuid,
// readable order_id, or PKG-…; member JWT, own payment only else 404).
// Row plus lifecycle fields: top-ups add purchase_status/purchased_at/
// expires_at, bookings add booking_status, both add voucher_code/
// discount_idr. Snap URLs pending-only.
// ----------------------------------------------------------------------

export interface IPaymentHistoryDetail extends IPackagePaymentHistoryItem {
  purchase_status?: string | null;
  purchased_at?: string | null;
  booking_status?: string | null;
  voucher_code?: string | null;
  discount_idr?: number | null;
}

export type TGetPaymentHistoryDetail = (ref: string) => Promise<IResponseData<IPaymentHistoryDetail>>;

export const getPaymentHistoryDetail: TGetPaymentHistoryDetail = async (ref) => {
  const res = await axiosx(true).get(`${MAIN_API_URL}/payments/history/${encodeURIComponent(ref)}`);
  return res.data;
};
