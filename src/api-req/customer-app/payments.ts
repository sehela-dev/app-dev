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
