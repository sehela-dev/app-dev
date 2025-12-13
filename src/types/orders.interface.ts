import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IOrderItem {
  order_id: string;
  customer_name: string;
  date_purchased: string;
  payment_method: string;
  type: string;
  price_idr: number;
  price_formatted: string;
  status: string;
  id: string;
}

export interface ICustomerData {
  name: string;
  id: string | number;
  phone: string;
  email: string;
}

export interface IAdminCartItemData {
  id: number | string;
  name: string;
  description?: string;
  variant?: string;
  badge?: string;
  price: number;
  quantity: number;
  subtotal: number;
}
export interface IAdminCartData {
  customer?: ICustomerData;
  cart?: IAdminCartItemData[];
}
export interface IClassData {
  id: number | string;
  class: string;
  session: string;
  instructor: string;
  date: string;
  joined: number;
  capacity: number;
  price: string;
  qty: number;
}

export interface IDetailOrder {
  order_id: string;
  payment_method: string;
  status: string;
  date: string;
  time: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  ordered_items: IOrderedItem[];
  total_price: number;
  total_price_formatted: string;
}

export interface IOrderedItem {
  item_name: string;
  item_detail: string;
  item_qty: number;
  item_total_price: number;
}

export type TOrderList = (param: ICommonParams) => Promise<IResponseData<IOrderItem[]>>;
export type TOrderDetail = (id: string) => Promise<IResponseData<IDetailOrder>>;
