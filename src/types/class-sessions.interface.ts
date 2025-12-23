import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface ISessionItem {
  id: string;
  session_id: string;
  session_name: string;
  class_id: string;
  capacity: number;
  instructor_id: string;
  instructor_name: string;
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

  //OTHER
  type: string; //regular
  level: string; // "advanced",
}

export interface IParticipantsSession {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  booking_status: string;
  attendance_status: string;
  created_at: string;
}

export type TSessionListData = (data: ICommonParams) => Promise<IResponseData<ISessionItem[]>>;
export type TSessionDetailData = (id: string) => Promise<IResponseData<ISessionItem>>;
export type TSessionBookings = ({ id, page, limit }: { id: string; page: number; limit: number }) => Promise<IResponseData<IParticipantsSession[]>>;
export type TCreateSessionData = (data: ICreateSessionPaylaod) => Promise<IResponseData<ISessionItem>>;
export type TEditSessionData = ({ id, data }: { id: string; data: ICreateSessionPaylaod }) => Promise<IResponseData<ISessionItem>>;
