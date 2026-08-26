import { IResponseData } from "@/lib/config";

export type LedgerEntryType = "credit_issue" | "credit_spend" | "credit_refund" | "adjustment" | "credit_expired";

export interface ILedgerSharedContext {
  is_shared_package: boolean;
  shared_with_user_id: string | null;
  shared_with_user_name: string | null;
  shared_with_user_email: string | null;
  shared_by_user_id: string | null;
  shared_by_user_name: string | null;
  shared_by_user_email: string | null;
}

export interface ILedgerEntry {
  id: string;
  entry_type: LedgerEntryType;
  amount: number;
  user_id: string;
  package_purchase_id: string;
  package_name: string;
  package_credits: number;
  note: string | null;
  created_at: string;
  shared_context: ILedgerSharedContext;
}

export interface ILedgerParams {
  page?: number;
  page_size?: number;
  type?: "earned" | "used" | "expired" | "all";
}

export interface ILedgerSummary {
  earned: number;
  used: number;
  expired: number;
  balance: number;
}

export type TGetCreditLedger = (params?: ILedgerParams) => Promise<IResponseData<ILedgerEntry[]> & { summary?: ILedgerSummary }>;
