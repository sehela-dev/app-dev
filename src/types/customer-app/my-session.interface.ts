import { IResponseData } from "@/lib/config";
import { ICommonParams } from "../general.interface";

export interface IMySessionItem {
  id: string;
  booking_status: string;
  attendance_status: string;
  credits_used: number;
  cancel_reason: string;
  canceled_at: string;
  notes: string;
  created_at: string;
  class_session: IClassSession;
}

export interface IClassSession {
  id: string;
  type: string;
  level: string;
  place: string;
  status: string;
  room_id: string;
  location: string;
  end_datetime: string;
  meeting_link?: string;
  session_name: string;
  start_datetime: string;
  instructor_name: string;
  location_address: string;
}

export interface IMySessionDetail {
  booking_id: string;
  booking_status: string;
  attendance_status: string;
  customer_name: string;
  class_name: string;
  session_name: string;
  instructor_name: string;
  type: string;
  level: string;
  place: string;
  location: string;
  location_address: string;
  location_maps_url: string;
  meeting_link: string;
  start_datetime: string;
  end_datetime: string;
  room_id: string;
  payment_method: string;
  price_idr: number;
  voucher_code: string;
  voucher_discount_idr: number;
  total_paid_idr: number;
  credits_used: number;
  cancel_reason: string;
  canceled_at: string;
  notes: string;
  created_at: string;
}

export type TMySession = (params: ICommonParams) => Promise<IResponseData<IMySessionItem[]>>;
export type TMySessionDetail = (id: string) => Promise<IResponseData<IMySessionDetail>>;
