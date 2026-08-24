import { IResponseData } from "@/lib/config";

export type RefundStatus = "requested" | "succeeded" | "failed";

export interface IRefundPayment {
  id: string;
  provider: string;
  gross_amount_idr: number;
  status: string;
  movement_type?: string | null;
  raw_status?: string | null;
  customer_name: string;
  customer_email: string;
}

export interface IRefundBookingSession {
  id: string;
  session_name: string;
  start_datetime: string;
}

export interface IRefundBooking {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  payment_method: string;
  booking_status: string;
  price_idr: number;
  revenue_idr: number;
  canceled_at: string | null;
  session: IRefundBookingSession;
}

export interface IRefundItem {
  id: string;
  refund_type: string;
  status: RefundStatus;
  movement_type?: string | null;
  raw_status?: string | null;
  amount_idr: number;
  reason: string | null;
  requested_at: string;
  confirmed_at: string | null;
  reviewer_name: string | null;
  reviewer_note: string | null;
  payment: IRefundPayment | null;
  booking: IRefundBooking | null;
}

export type RefundMovementFilter = "voided" | "collected" | "outstanding" | "all" | "refund";

export interface IRefundListParams {
  page?: number;
  limit?: number;
  status?: RefundStatus | "all";
  movement_type?: RefundMovementFilter;
}

export interface IRefundReviewPayload {
  id: string;
  note?: string;
}

export type TGetRefunds = (params: IRefundListParams) => Promise<IResponseData<IRefundItem[]>>;
export type TGetRefundDetail = (id: string) => Promise<IResponseData<IRefundItem>>;
export type TReviewRefund = (data: IRefundReviewPayload) => Promise<IResponseData<unknown>>;
