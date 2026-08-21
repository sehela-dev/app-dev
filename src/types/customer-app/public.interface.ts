import { IResponseData } from "@/lib/config";

export interface IPublicPagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
}

// ----------------------------------------------------------------------
// GET /public/classes
// ----------------------------------------------------------------------

export interface IPublicClassesParams {
  q?: string;
  page?: number;
  page_size?: number;
}

export interface IPublicClass {
  id: string;
  class_name: string;
  class_description: string | null;
  allow_credit: boolean;
}

export interface IPublicClassesResponse {
  success: boolean;
  data: IPublicClass[];
  pagination: IPublicPagination;
}

export type TGetPublicClasses = (params?: IPublicClassesParams) => Promise<IPublicClassesResponse>;

// ----------------------------------------------------------------------
// GET /public/instructors
// ----------------------------------------------------------------------

export interface IPublicInstructorsParams {
  q?: string;
  page?: number;
  page_size?: number;
}

export interface IPublicInstructor {
  id: string;
  full_name: string;
  photo_url: string | null;
  description: string | null;
}

export interface IPublicInstructorsResponse {
  success: boolean;
  data: IPublicInstructor[];
  pagination: IPublicPagination;
}

export type TGetPublicInstructors = (params?: IPublicInstructorsParams) => Promise<IPublicInstructorsResponse>;

// ----------------------------------------------------------------------
// GET /public/locations
// ----------------------------------------------------------------------

export interface IPublicLocationsParams {
  q?: string;
  page?: number;
  page_size?: number;
}

export interface IPublicLocation {
  id: string;
  name: string;
  address: string | null;
  maps_url: string | null;
}

export interface IPublicLocationsResponse {
  success: boolean;
  data: IPublicLocation[];
  pagination: IPublicPagination;
}

export type TGetPublicLocations = (params?: IPublicLocationsParams) => Promise<IPublicLocationsResponse>;

// ----------------------------------------------------------------------
// GET /public/sessions
// ----------------------------------------------------------------------

export interface IPublicSessionsParams {
  date?: string;
  class_id?: string;
  instructor_id?: string;
  location_id?: string;
  type?: string;
  level?: string;
  place?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
}

export interface IPublicSession {
  id: string;
  session_id: string | null;
  session_name: string;
  session_description: string | null;
  class_id: string | null;
  class_name: string | null;
  allow_credit: boolean | null;
  instructor_id: string | null;
  instructor_name: string | null;
  start_datetime: string;
  end_datetime: string;
  start_date: string;
  time_start: string;
  time_end: string;
  type: string;
  level: string | null;
  place: string;
  location_id: string | null;
  location_name: string | null;
  location_address: string | null;
  location_maps_url: string | null;
  meeting_link: string | null;
  price_idr: number;
  price_credit_amount: number | null;
  slots_booked: number;
  slots_total: number;
  slots_available: number;
  is_full: boolean;
  status: string;
}

export interface IPublicSessionsResponse {
  success: boolean;
  data: Array<{
    date: string;
    sessions: IPublicSession[];
  }>;
  summary: {
    date: string;
    total_sessions: number;
  };
  pagination: IPublicPagination;
}

export type TGetPublicSessions = (params?: IPublicSessionsParams) => Promise<IPublicSessionsResponse>;

export type TGetPublicSession = (id: string) => Promise<IPublicSession>;

// ----------------------------------------------------------------------
// GET /public/bookings/:id
// ----------------------------------------------------------------------

export interface IPublicBookingDetail {
  booking_id: string;
  payment_id: string;
  order_id: string;
  amount_idr: number;
  class_name: string;
  start_datetime: string;
  booking_status: string;
  payment_status: string;
  payment_method: string;
  qris_image_url?: string;
  payment_instructions?: string;
  expires_at?: string;
  snap_token?: string;
  snap_redirect_url?: string;
}

export type TGetPublicBookingDetail = (id: string) => Promise<IResponseData<IPublicBookingDetail>>;