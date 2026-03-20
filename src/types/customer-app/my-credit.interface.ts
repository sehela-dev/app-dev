import { IResponseData } from "@/lib/config";

export interface IMyCreditItem {
  package_purchase_id: string;
  package_id: string;
  package_name: string;
  package_description: string;
  total_credits: number;
  credits_remaining: number;
  credits_used: number;
  price_paid_idr: number;
  purchased_at: string;
  first_used_at: string;
  expires_at: string;
  validity_days: number;
  status: string;
  validity_status: string;
  is_expired: boolean;
  session_type_restriction?: string | string[];
  place_restriction: string | string[];
  class_ids_restriction?: string[];
  class_type_restriction?: string | string[];
  is_owner: boolean;
  is_shared: boolean;
  shared_with_user_id?: string;
  shared_with_user_name?: string;
  shared_by_user_id?: string;
  shared_by_user_name?: string;
}

export type TMyCreditResponse = () => Promise<IResponseData<IMyCreditItem[]>>;
