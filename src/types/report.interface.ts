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
  validity_status?: string;
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

// Outstanding snapshot (as_of / year-month) — GET /admin/credits/outstanding/*
export interface IOutstandingDetailParams {
  asOf?: string; // YYYY-MM-DD, maps to ?as_of
  year?: number;
  month?: number;
  format?: "json" | "csv";
  page?: number;
  page_size?: number;
}

export interface IOutstandingDetailResponse {
  period: string;
  generated_at: string;
  total_packages: number;
  packages: IPackage[];
}

export interface IOutstandingSummaryData {
  period: string;
  generated_at: string;
  summary: {
    total_outstanding_credits: number;
    total_outstanding_value_idr: number;
    total_customers: number;
    total_active_packages: number;
    avg_credits_per_customer: number;
    opening_credits: number;
    credits_issued: number;
    credits_used: number;
    credits_expired: number;
    closing_credits: number;
  };
  by_expiry_status: { validity_status: string; credits: number; value_idr: number; packages: number }[];
  by_package_type: { package_id: string; package_name: string; credits: number; value_idr: number; percentage: number }[];
}

export interface IOutstandingReportsParams {
  year?: number;
  page?: number;
  page_size?: number;
}

export interface IOutstandingReportItem {
  report_id: string;
  period: string;
  period_start?: string;
  period_end?: string;
  summary_file: ISummaryFile;
  detail_file: IDetailFile;
  generated_at: string;
  is_incomplete: boolean;
}

export type TOutstandingDetail = (params: IOutstandingDetailParams) => Promise<IResponseData<IOutstandingDetailResponse>>;
export type TOutstandingSummary = (params: Omit<IOutstandingDetailParams, "format">) => Promise<IResponseData<IOutstandingSummaryData>>;
export type TOutstandingReports = (params: IOutstandingReportsParams) => Promise<IResponseData<IOutstandingReportItem[]>>;

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

// GET /admin/credits/ledger — handoff 2026-09-10 (admin v239): 12-col table, no technical balances
export type LedgerEntryType = "credit_issue" | "credit_spend" | "credit_refund" | "credit_expired" | "adjustment";

// Response entry_type labels (BE returns Title-case in data rows)
export type LedgerRowEntryType = "Issue" | "Spend" | "Expired" | "Refund" | "Adjustment";

export type RecognitionStatus =
  | "Recognized Revenue"
  | "Deferred Future Revenue"
  | "Credit Reserved"
  | "Credit Refunded"
  | "Refund Future Revenue";

export type LedgerAttendance = "attended" | "no_show" | null;

export interface ICreditsLedgerParams {
  user_id?: string;
  package_purchase_id?: string;
  entry_type?: string; // csv e.g. "credit_spend,credit_refund"
  status?: string; // csv of RecognitionStatus labels (post-enrich filter)
  start_date?: string; // YYYY-MM-DD
  end_date?: string;
  q?: string; // customer name OR package name OR note
  page?: number;
  page_size?: number;
  order?: "asc" | "desc";
  format?: "json" | "csv";
}

export interface ICreditsLedgerItem {
  id: string;
  entry_type: LedgerRowEntryType;
  customer_name: string | null;
  amount: number;
  nilai_idr: number;
  package_name: string | null;
  expiry_date: string | null;
  session_date: string | null;
  attendance: LedgerAttendance;
  recognition_status: RecognitionStatus;
  recognition_month: string | null; // YYYY-MM
  note: string | null;
  recognized_at: string | null;
  created_at: string;
  created_at_wib: string;
}

export interface ICreditsLedgerMeta {
  periode: string;
  generated_at?: string;
  generated_at_wib: string;
  filters: {
    user_id?: string | null;
    package_purchase_id?: string | null;
    entry_type?: string | string[] | null;
    status?: string[] | null;
    start_date: string | null;
    end_date: string | null;
    q: string | null;
    order?: string | null;
  };
  total_items: number;
}

export interface IDeferredBucket {
  count: number;
  credits: number;
  value_idr: number;
  journal: string;
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
  deferred_buckets?: {
    terjual: IDeferredBucket;
    diakui_hadir: IDeferredBucket;
    diakui_no_show: IDeferredBucket;
    breakage: IDeferredBucket;
    diakui_total: { value_idr: number; journal: string };
    saldo_tangguhan_akhir: { value_idr: number; credits: number; packages: number; journal: string };
  };
}

export type TCreditsLedger = (params: ICreditsLedgerParams) => Promise<IResponseData<ICreditsLedgerItem[]> & { meta?: ICreditsLedgerMeta }>;

export type TCreditsLedgerSummary = (params: Omit<ICreditsLedgerParams, "page" | "page_size" | "order" | "format" | "status">) => Promise<IResponseData<ICreditsLedgerSummary>>;

export interface IRecognitionRunResult {
  job_date: string;
  credit_attended: number;
  credit_no_show: number;
  cash_attended: number;
  cash_no_show: number;
  breakage: number;
}

export type TCashFlowReport = (data: IParamsCashFlowReport) => Promise<IResponseData<ICashFlowResponse>>;
