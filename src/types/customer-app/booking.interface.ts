import { IResponseData } from "@/lib/config";

// ----------------------------------------------------------------------
// GET /credit-packages/eligible
// ----------------------------------------------------------------------

export interface IEligibleCreditsParams {
  class_id: string;
  session_type: string;
  place: string;
}

export interface IEligibleCreditPackage {
  package_purchase_id: string;
  package_id?: string;
  package_name: string;
  package_description: string | null;
  credits_remaining: number;
  total_credits: number;
  first_used_at: string | null;
  expires_at: string | null;
  validity_days: number;
  validity_status: string;
  session_type_restriction?: string | string[] | null;
  place_restriction?: string | string[] | null;
  class_ids_restriction?: string[] | null;
  is_owner: boolean;
  is_shared: boolean;
}

export type TEligibleCreditsResponse = (params: IEligibleCreditsParams) => Promise<IResponseData<IEligibleCreditPackage[]>>;

// ----------------------------------------------------------------------
// POST /profile/bookings (credits path)
// ----------------------------------------------------------------------

export interface ICreateBookingRequest {
  class_session_id: string;
  payment_method: "credits";
  package_purchase_id: string;
  credits_to_use?: number;
  notes?: string;
}

export interface ICreateBookingResponse {
  booking_id: string;
  ledger_id: string;
  status: string;
  payment_method: string;
  credits_used: number;
  credit_unit_value_idr: number;
  revenue_idr: number;
}

export type TCreateBooking = (body: ICreateBookingRequest) => Promise<IResponseData<ICreateBookingResponse>>;

// ----------------------------------------------------------------------
// POST /public/bookings (cash/drop-in path)
// ----------------------------------------------------------------------

export interface ICreatePublicBookingRequest {
  class_session_id: string;
  payment_method: "cash";
}

export interface ICreatePublicBookingResponse {
  booking_id: string;
  payment_id: string;
  order_id: string;
  amount_idr: number;
  class_name: string;
  start_datetime: string;
  booking_status: string;
  payment_status: string;
  payment_method: string;
  snap_token?: string;
  snap_redirect_url?: string;
  qris_image_url?: string;
  payment_instructions?: string;
  expires_at?: string;
}

export type TCreatePublicBooking = (body: ICreatePublicBookingRequest) => Promise<IResponseData<ICreatePublicBookingResponse>>;

// ----------------------------------------------------------------------
// POST /public/bookings/:booking_id/repay (retry payment)
// ----------------------------------------------------------------------

export interface IRepayBookingResponse {
  booking_id: string;
  payment_id: string;
  order_id: string;
  amount_idr?: number;
  snap_token?: string;
  snap_redirect_url?: string;
  qris_image_url?: string;
  expires_at?: string;
}

export type TRepayBooking = (bookingId: string) => Promise<IResponseData<IRepayBookingResponse>>;
