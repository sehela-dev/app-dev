import { IPagiantion, IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IInstructorData {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
}

export interface ICreateIntructorPayload {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  status?: string;
  description: string;
  bank_name?: string;
  bank_account_number?: string;
  payment_rules?: IPaymentRule[] | null;
}
export interface IInstructorDetails {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  role?: string;
  is_active?: boolean;
  payment_models: unknown;
  bank_name: string;
  bank_account_number: string;
  description: string;
  payment_rules?: IPaymentRuleResponse[];
  created_at: string;
  updated_at: string;
}

export interface IPaymentRuleResponse {
  session_type: string;
  session_place: string | null;
  payment_model: string;
  model_params: IModelParams;
}

export interface IPaymentRule {
  session_type: string;
  session_place?: string | null;
  payment_model: string;
  model_params: IModelParams;
}

export interface IModelParams {
  percentage?: number;
  min_amount?: number;
  min_threshold_people?: number;
  amount?: number;
  credit_rate?: number;
  non_credit_rate?: number;
  base_amount?: number;
  additional_per_person?: number;
  base_people?: number;
  per_person_amount?: number;
}

export interface IFormValuesAddInstructor extends Omit<ICreateIntructorPayload, "bank_name"> {
  bank_name: {
    label: string;
    value: string;
  };
  regular: IPaymentRuleForm | null;
  reg_online: IPaymentRuleForm | null;
  private: IPaymentRuleForm | null;
  special: IPaymentRuleForm | null;
  payment_model?: string;
}

export interface IPaymentRuleForm {
  payment_model?: string;
  model_params?: IModelParams;
}
export type TCreateInstructor = (data: ICreateIntructorPayload) => Promise<IResponseData<IInstructorData>>;
export type TEditInstructor = ({ data, id }: { data: ICreateIntructorPayload; id: string }) => Promise<IResponseData<IInstructorData>>;
export type TInstructorData = (params: ICommonParams) => Promise<IResponseData<IInstructorData[]>>;
export type TInstructorDetail = (id: string) => Promise<IResponseData<IInstructorDetails>>;

export type TClassPaymentInstructor = (params: ICommonParams) => Promise<IResponseData<IInstructorPaymentResponse>>;

export interface IInstructorPaymentResponse {
  instructor_id: string;
  instructor_name: string;
  period: Period;
  page_summary: PageSummary;
  sessions?: ISessionInstructorPayment[];
  pagination: IPagiantion;
}

export interface Period {
  start_date: string;
  end_date: string;
}

export interface PageSummary {
  total_sessions: number;
  total_bookings: number;
  total_revenue: number;
  total_payment: number;
}

export interface ISessionInstructorPayment {
  session_id: string;
  session_code: string;
  session_name: string;
  class_name: string;
  session_date: string;
  session_type: string;
  session_place: string;
  total_bookings: number;
  credit_bookings: number;
  non_credit_bookings: number;
  third_party_bookings: number;
  total_revenue: number;
  payment_model: string;
  calculated_payment: number;
}

export interface IExportInstructorPayment {
  report_id: string;
  instructor_id: string;
  instructor_name: string;
  period: string;
  total_sessions: number;
  total_bookings: number;
  total_revenue: number;
  total_payment: number;
  file_name: string;
  storage_path: string;
  download_url: string;
}

export interface IPayloadExport {
  id: string;
  year: number | string;
  month: number | string;
}

export interface IPaymentDetailsResponse {
  session: ISessionPaymentDetail;
  bookings: IBookingPaymentDetail[];
  payment: IPaymentDetail;
}

export interface ISessionPaymentDetail {
  session_id: string;
  session_code: string;
  session_name: string;
  class_name: string;
  session_date: string;
  session_type: string;
  session_place: string;
  session_status: string;
  price_idr: number;
  instructor_id: string;
  instructor_name: string;
}
export interface IPaymentDetail {
  total_bookings: number;
  credit_bookings: number;
  non_credit_bookings: number;
  third_party_bookings: number;
  total_revenue: number;
  payment_model: string;
  calculated_payment: number;
  calculation_details?: {
    fixed_amount: string;
  } | null;
}

export interface IBookingPaymentDetail {
  booking_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  booking_status: string;
  attendance_status: string;
  payment_method: string;
  credits_used: number;
  credit_unit_value_idr: string | number;
  price_idr: number;
  revenue_idr: number;
  source_platform: string;
  platform_fee_idr: number;
  third_party_id: string;
  voucher_code: string;
  voucher_discount_idr: number;
  created_at: string;
}
export type TExportInstructorPayment = (data: IPayloadExport) => Promise<IResponseData<IExportInstructorPayment>>;

export type TInstructorSessionPaymentDetails = (data: string) => Promise<IResponseData<IPaymentDetailsResponse>>;
