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
  room_id: string | null;
  branch: string | null;
  location: string;
  location_address: string;
  location_maps_url: string;
  meeting_link: string;
  price_idr: number;
  price_credit_amount: number;
  status: string;
  is_published?: boolean;
  publish_at?: string | null;
  cancellation_fee_idr?: number;
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
  is_credit_only?: boolean;
  photo_url?: string | null;
}

export interface IClassSession {
  id: string;
  class_name: string;
  allow_credit: boolean;
  cancellation_fee_idr?: number;
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
  is_credit_only?: boolean;
  photo_url?: string | null;
  photo?: File | null;
  recurring?: {
    type: string;
    count: string | number;
  };

  //OTHER
  type: string; //regular
  level: string; // "advanced",
  payment?: IPaymentRule | null;
  is_published?: boolean;
  publish_at?: string | null;
}

export interface IBookingPaidWith {
  type: "credits" | "cash" | string;
  provider?: string | null;
  price_idr?: number;
  gross_amount_idr?: number;
  revenue_idr?: number;
  voucher_code?: string | null;
  voucher_discount_idr?: number;
  credits_used?: number;
  credit_unit_value_idr?: number;
  package_purchase_id?: string;
  package_name?: string;
  package_credits?: number;
  package_price_idr?: number;
  package_status?: string;
  package_actual_amount_paid_idr?: number;
  package_purchased_at?: string;
  package_expires_at?: string | null;
}

export interface IParticipantsSession {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  booking_status: string;
  attendance_status: string | null;
  payment_method: string;
  payment_status?: string;
  paid_with: IBookingPaidWith | null;
  medical_notes: string | null;
  remark: string | null;
  photo_consent: boolean;
  instagram_username: string | null;
  rescheduled_to_booking_id: string | null;
  created_at: string;
}

export type TSessionListData = (data: ICommonParams) => Promise<IResponseData<ISessionItem[]>>;
export type TSessionDetailData = (id: string) => Promise<IResponseData<ISessionItem>>;
export type TSessionBookings = ({ id, page, limit }: { id: string; page: number; limit: number }) => Promise<IResponseData<IParticipantsSession[]>>;
export type TCreateSessionData = (data: ICreateSessionPaylaod | FormData) => Promise<IResponseData<ISessionItem>>;
export type TEditSessionData = ({ id, data }: { id: string; data: ICreateSessionPaylaod | FormData }) => Promise<IResponseData<ISessionItem>>;

export type TDuplicateDateItem = string | { start_date: string; time_start?: string; time_end?: string };

export interface IDuplicateSessionPayload {
  dates: TDuplicateDateItem[];
  is_published?: boolean;
  publish_at?: string | null;
}

export interface IDuplicateSessionResult {
  sessions: ISessionItem[];
  summary: { total_requested: number; created: number; failed: number };
  errors?: { date: string; error: string }[];
}

export type TDuplicateSessionData = ({ id, data }: { id: string; data: IDuplicateSessionPayload }) => Promise<IResponseData<IDuplicateSessionResult>>;

export interface IPublishBatchResult {
  sessions: ISessionItem[];
  summary: { total_requested: number; updated: number; not_found: number };
  not_found_ids?: string[];
}

export type TPublishBatchData = (data: { ids: string[]; is_published?: boolean }) => Promise<IResponseData<IPublishBatchResult>>;

export type TDuplicateRangeMode = "day" | "week" | "month" | "custom";

export interface IDuplicateRangeSource {
  mode: TDuplicateRangeMode;
  date?: string;
  start_date?: string;
  end_date?: string;
}

export interface IDuplicateRangeBase {
  source: IDuplicateRangeSource;
  target_date: string;
}

export interface IDuplicateConflictWith {
  kind?: "session" | "block";
  existing_session_name?: string;
  block_title?: string;
  [k: string]: unknown;
}

export interface IDuplicateSourceBlock {
  id?: string;
  title?: string;
  [k: string]: unknown;
}

export interface IDuplicatePreviewEntry {
  source_id: string;
  session_name: string;
  new_start_datetime: string;
  room_id: string | null;
  conflict: boolean;
  conflict_with?: IDuplicateConflictWith | null;
}

export interface IDuplicatePreviewResult {
  source: {
    mode: string;
    start_date: string;
    end_date: string;
    entries: number;
    classes_count: number;
    blocks_count?: number;
    blocks?: IDuplicateSourceBlock[];
  };
  target: { date: string; entries: number };
  entries: IDuplicatePreviewEntry[];
  summary: { total: number; conflicts: number; copies: number };
}

export interface IDuplicateRangePayload extends IDuplicateRangeBase {
  is_published?: boolean;
  publish_at?: string | null;
  skip_conflicts?: boolean;
}

export interface IDuplicateRangeResult {
  sessions: ISessionItem[];
  summary: { total: number; created: number; skipped: number; failed: number };
  skipped_conflicts?: IDuplicatePreviewEntry[];
  errors?: { date?: string; source_id?: string; error: string }[];
}

export type TDuplicatePreviewData = (data: IDuplicateRangeBase) => Promise<IResponseData<IDuplicatePreviewResult>>;
export type TDuplicateRangeData = (data: IDuplicateRangePayload) => Promise<IResponseData<IDuplicateRangeResult>>;
export type TSessionCancelRefundType = "none" | "smart" | "credit_return" | "credit_issue_new" | "manual_external";

export interface ISessionCancelParams {
  id: string;
  confirm?: boolean;
  default_refund_type?: TSessionCancelRefundType;
  cancel_reason?: string;
  refund_validity_days?: number;
}

export type TSessionCancelRefundTo =
  | { kind: "original_package"; package_purchase_id: string; package_name: string; expires_at?: string; days_remaining?: number }
  | {
      kind: "new_refund_package";
      package_name: string;
      credits: number;
      value_idr?: number;
      validity_days?: number;
      restrictions?: { session_type?: string; place?: string; class_ids?: string[] };
    }
  | { kind: "none" };

export interface ISessionCancelPreviewBooking {
  booking_id: string;
  user_id?: string | null;
  customer_name?: string;
  payment_method?: string;
  payment_detail?: string | null;
  package_name?: string | null;
  credits_used?: number;
  package_purchase_id?: string | null;
  source_platform?: string | null;
  package_expired?: boolean;
  package_days_remaining?: number | null;
  refund_type: string;
  escalation_reason?: string | null;
  refund_to?: TSessionCancelRefundTo | null;
}

export interface ISessionCancelPreview {
  mode: "preview";
  session: { id: string; session_name: string; start_datetime: string; status: string; type?: string; place?: string; class_id?: string };
  active_bookings_count: number;
  bookings: ISessionCancelPreviewBooking[];
}

export interface ISessionCancelCommitRefundResult {
  booking_id: string;
  refund_type: string;
  status: string;
  credits_refunded?: number;
  refund_value_idr?: number;
  refund_package_purchase_id?: string;
  auto_escalated?: boolean;
  escalation_reason?: string;
  error?: string;
}

export interface ISessionCancelCommit {
  mode: "commit";
  data: ISessionItem;
  refunds?: {
    summary: { total_bookings: number; succeeded: number; failed: number; auto_escalated: number };
    results: ISessionCancelCommitRefundResult[];
  };
}
