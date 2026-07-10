import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";
import { IModelParams, IPaymentRule } from "./instructor.interface";

export interface ISessionItem {
  id: string;
  session_id: string;
  session_name: string;
  class_id: string;
  capacity: number;
  instructor_id: string;
  instructor_name: string;
  instructor_payment_model?: string;
  instructor_payment_params?: IModelParams;
  session_description: string;
  start_datetime: string;
  end_datetime: string;
  type: string;
  level: string;
  place: string;
  room_id: string;
  location: string;
  location_address: string;
  location_maps_url: string;
  meeting_link: string;
  price_idr: number;
  price_credit_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  class: IClassSession;
  start_date: string;
  time_start: string;
  time_end: string;
  slots_booked: number;
  slots_total: number;
  slots_available: number;
  slots_display: string;
  is_full: boolean;
}

export interface IClassSession {
  id: string;
  class_name: string;
  allow_credit: boolean;
}

export interface ICreateSessionPaylaod {
  session_name: string;
  class_id: string;
  capacity: number;
  instructor_id: string;
  session_description: string;

  //DATE AND TIME
  start_date: string;
  time_start: string;
  time_end: string;

  //LOCATION
  place: string;
  room_id?: string;
  location?: string;
  location_address?: string;
  location_maps_url?: string;
  meeting_link?: string;

  //PRICING
  price_idr: number;
  price_credit_amount: number;
  recurring?: {
    type: string;
    count: string | number;
  };

  //OTHER
  type: string; //regular
  level: string; // "advanced",
  payment?: IPaymentRule | null;
}

export interface IParticipantsSession {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  booking_status: string;
  attendance_status: string;
  medical_notes: string;
  photo_consent: string;
  created_at: string;
  instagram_username?: string;
}

export type TSessionListData = (data: ICommonParams) => Promise<IResponseData<ISessionItem[]>>;
export type TSessionDetailData = (id: string) => Promise<IResponseData<ISessionItem>>;
export type TSessionBookings = ({ id, page, limit }: { id: string; page: number; limit: number }) => Promise<IResponseData<IParticipantsSession[]>>;
export type TCreateSessionData = (data: ICreateSessionPaylaod) => Promise<IResponseData<ISessionItem>>;
export type TEditSessionData = ({ id, data }: { id: string; data: ICreateSessionPaylaod }) => Promise<IResponseData<ISessionItem>>;

export interface ICancelationListResponse {
  mode: string;
  session: ISessionCancelation;
  active_bookings_count: number;
  bookings: IBookingList[];
}

export interface ISessionCancelation {
  id: string;
  session_name: string;
  start_datetime: string;
  status: string;
  type: string;
  place: string;
  class_id: string;
  capacity: number;
}

export interface IBookingList {
  booking_id: string;
  user_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  booking_status: string;
  payment_method: string;
  price_idr: number;
  revenue_idr: number;
  credits_used: number;
  credit_unit_value_idr?: number;
  package_purchase_id?: string;
  source_platform?: string;
  package?: IPackage;
  package_days_remaining?: number;
  package_expired: boolean;
  credit_return_warning?: string;
  suggested_refund_type: string;
  valid_refund_types: string[];
}

export interface IPackage {
  id: string;
  status: string;
  expires_at: string;
  credit_package: ICreditPackage;
}

export interface ICreditPackage {
  id: string;
  name: string;
  session_type_restriction: string[];
  place_restriction?: string[];
  class_ids_restriction: any;
}

export type TCancelationBookings = (id: string) => Promise<IResponseData<ICancelationListResponse>>;

export interface IBookingRefundOverride {
  refund_type: string;
  refund_amount_idr?: number;
  refund_validity_days?: number;
}

export interface ICancelSessionPayload {
  confirm: boolean;
  cancel_reason: string;
  default_refund_type: string;
  refund_validity_days: number;
  booking_overrides: Record<string, IBookingRefundOverride>;
}

export type TConfirmCancelSession = ({
  id,
  data,
}: {
  id: string;
  data: ICancelSessionPayload;
}) => Promise<IResponseData<ICancelationListResponse>>;
