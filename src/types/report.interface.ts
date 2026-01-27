import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface ITableOutstandingReportResponse {
  period: IPeriod;
  summary: ISummary;
  packages: IPackage[];
}

export interface IPeriod {
  start_date: string;
  end_date: string;
  days: number;
}

export interface ISummary {
  total_packages: number;
  by_status: ByStatus;
  totals: ITotals;
}

export interface ByStatus {
  active: number;
  not_started: number;
  expiring_soon: number;
  fully_used: number;
  expired: number;
}

export interface ITotals {
  total_credits_purchased: number;
  total_credits_remaining: number;
  total_credits_used: number;
  total_credits_expired: number;
  total_amount_paid_idr: number;
  total_outstanding_value_idr: number;
  total_used_value_idr: number;
  total_expired_value_idr: number;
}

export interface IPackage {
  package_status: string;
  package_purchase_id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  package_name: string;
  package_type: string;
  total_credits: number;
  credits_remaining: number;
  credits_used: number;
  credits_expired: number;
  original_price_idr: number;
  discount_idr: number;
  voucher_code: string;
  actual_amount_paid_idr: number;
  per_credit_value_idr: number;
  used_value_idr: number;
  expired_value_idr: number;
  outstanding_value_idr: number;
  purchased_at: string;
  first_used_at?: string;
  expires_at?: string;
  days_until_expiry?: number;
  is_shared: boolean;
  shared_with_name: string;
}

export interface IGenerateReportOutstanding {
  month?: string;
  year?: string;
}

export interface IGeenrateOutstandingResponse {
  report_id: string;
  period: string;
  period_start: string;
  period_end: string;
  total_outstanding_credits: number;
  total_outstanding_value_idr: number;
  total_customers: number;
  total_active_packages: number;
  credits_issued: number;
  credits_used: number;
  credits_expired: number;
  opening_credits: number;
  closing_credits: number;
  summary_file: ISummaryFile;
  detail_file: IDetailFile;
  generated_at: string;
  is_cached: boolean;
  is_incomplete: boolean;
}

export interface ISummaryFile {
  file_name: string;
  storage_path: string;
  download_url: string;
}

export interface IDetailFile {
  file_name: string;
  storage_path: string;
  row_count: number;
  download_url: string;
}

export type TOutstandingCreditTable = (params: ICommonParams) => Promise<IResponseData<ITableOutstandingReportResponse>>;

export type TGenerateReportOutstandingCredit = (data: IGenerateReportOutstanding) => Promise<IResponseData<IGeenrateOutstandingResponse>>;
