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

export type TMySession = (params: ICommonParams) => Promise<IResponseData<IMySessionItem[]>>;
