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
