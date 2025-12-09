import { IPagination } from "./general.interface";

export interface IOrderItem {
  orderId: string;
  customer: string;
  date: string;
  paymentMethod: string;
  amountReceived: number;
  status: string;
}

interface OrdersResponse {
  data: IOrderItem[];
  pagination: IPagination;
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
