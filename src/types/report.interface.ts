import { IPagiantion, IResponseData } from "@/lib/config";
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

// /reports/cash-movement

export interface IParamsCashFlowReport extends ICommonParams {
  branch?: string;
  date?: string;
}
export interface ICashFlowResponse {
  date: string;
  branch: string | null;
  summary: ISummaryCashFlow;
  by_payment_method: ICashFlowByPaymentMethod[];
  total_transactions: number;
  transactions: ICashFlowTransaction[];
  pagination: IPagiantion;
}

export interface ISummaryCashFlow {
  collected: number;
  collected_count: number;
  refund: number;
  refund_count: number;
  voided: number;
  voided_count: number;
  outstanding: number;
  outstanding_count: number;
  net_movement: number;
}

export interface ICashFlowByPaymentMethod {
  payment_method: string;
  collected: number;
  refund: number;
  voided: number;
  outstanding: number;
  net: number;
  transaction_count: number;
}

export interface ICashFlowTransaction {
  id: string;
  order_id: string;
  payment_method: string;
  branch?: string | null;
  amount_idr: number;
  movement_type: string;
  raw_status: string;
  status: string;
  created_at: string;
}

// GET /admin/credits/ledger — log view over credits_ledger
export type LedgerEntryType = "credit_issue" | "credit_spend" | "credit_refund" | "credit_expired" | "adjustment";

export interface ICreditsLedgerParams {
  user_id?: string;
  package_purchase_id?: string;
  entry_type?: string; // csv e.g. "credit_spend,credit_refund"
  start_date?: string; // YYYY-MM-DD
  end_date?: string;
  q?: string;
  page?: number;
  page_size?: number;
  order?: "asc" | "desc";
  format?: "json" | "csv";
}

export interface ICreditsLedgerItem {
  id: string;
  entry_type: LedgerEntryType;
  amount: number;
  unit_value_idr: number | null;
  total_value_idr: number | null;
  note: string | null;
  created_at: string;
  created_at_wib: string;
  ref_id: string | null;
  booking: {
    id: string;
    customer_name: string;
    attendance_status: string | null;
    class_session: { session_name: string; start_datetime: string } | null;
  } | null;
  package_purchase: { id: string; package_name: string; purchased_at: string; expires_at: string } | null;
  customer: { user_id: string; full_name: string; phone: string } | null;
  balance_before_credits?: number | null;
  balance_after_credits?: number | null;
  balance_before_value_idr?: number | null;
  balance_after_value_idr?: number | null;
  is_outstanding?: boolean;
  is_package_outstanding?: boolean;
}

export interface ICreditsLedgerMeta {
  periode: string;
  generated_at?: string;
  generated_at_wib: string;
  filters: {
    user_id?: string | null;
    package_purchase_id?: string | null;
    entry_type?: string | string[] | null;
    start_date: string | null;
    end_date: string | null;
    q: string | null;
    order?: string | null;
  };
  total_items: number;
}

export interface ICreditsLedgerSummary {
  periode: string;
  total_movements: number;
  by_type: Record<string, { count: number; credits: number; value_idr: number }>;
  net_credits: number;
  net_value_idr: number;
  outstanding: { packages: number; credits: number; value_idr: number };
  // flat aliases (keep optional for BE compat)
  outstanding_packages?: number;
  outstanding_credits?: number;
  outstanding_value_idr?: number;
}

export type TCreditsLedger = (params: ICreditsLedgerParams) => Promise<IResponseData<ICreditsLedgerItem[]> & { meta?: ICreditsLedgerMeta }>;

export type TCreditsLedgerSummary = (params: Omit<ICreditsLedgerParams, "page" | "page_size" | "order" | "format">) => Promise<IResponseData<ICreditsLedgerSummary>>;

export type TCashFlowReport = (data: IParamsCashFlowReport) => Promise<IResponseData<ICashFlowResponse>>;
