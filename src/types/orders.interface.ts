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
  id?: string | number;
  phone: string;
  email: string;
  role?: string;
  is_active: string;
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
  type?: string;
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

export interface IAddTransactionPayload {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  user_id?: string;
  sessions?: ISession[] | [];
  products?: IProduct[] | [];
  notes: string;
  status: string;
}

export interface ISession {
  class_session_id: string;
}

export interface IProduct {
  variant_id: string;
  quantity: number;
}

// creatae new manual trx
export interface ICreatManualTrxResponse {
  payment_id: string;
  order_code: string;
  total_price_idr: number;
  status: string;
  bookings: IBooking[];
  order: IOrder;
}

export interface IBooking {
  id: string;
  price_idr: number;
  booking_status: string;
  class_session: IClassSession;
}

export interface IClassSession {
  id: string;
  type: string;
  level: string;
  place: string;
  session_name: string;
  start_datetime: string;
}

export interface IOrder {
  id: string;
  total_price_idr: number;
  fulfillment_status: string;
  items: Item[];
}

export interface Item {
  id: string;
  quantity: number;
  product_name: string;
  variant_name: string;
  unit_price_idr: number;
  total_price_idr: number;
}

export type TOrderList = (param: ICommonParams) => Promise<IResponseData<IOrderItem[]>>;
export type TOrderDetail = (id: string) => Promise<IResponseData<IDetailOrder>>;
export type TCreateManualOrder = (payload: IAddTransactionPayload) => Promise<IResponseData<ICreatManualTrxResponse>>;
