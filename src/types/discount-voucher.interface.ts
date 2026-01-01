import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export type TDiscountType = "percentage" | "fixed";
export type TCategoryVoucher = "booking" | "package-purchase" | "order" | "universal";

export interface IVouchersListItem {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  discount_type: TDiscountType;
  discount_value: number;
  min_purchase_idr: number;
  max_discount_idr: number;
  usage_limit: number;
  usage_count: number;
  one_per_user: boolean;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ICreateVoucherPaylaod {
  name: string;
  code: string;
  category: TCategoryVoucher;
  discount_type: TDiscountType;
  discount_value: number;
  min_purchase_idr: number;
  max_discount_idr?: number;
  usage_limit: number;
  one_per_user: boolean;
  valid_from: string;
  valid_until: string;
}

export type TGetVouchers = (params: ICommonParams) => Promise<IResponseData<IVouchersListItem[]>>;
export type TCreateVouchers = (data: ICreateVoucherPaylaod) => Promise<IResponseData<IVouchersListItem>>;
