import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IRentalVariant {
  id?: string;
  sku?: string;
  price_idr?: number;
  variant_name?: string;
}

export interface IRentalOrderItem {
  id?: string;
  product_name?: string;
  variant_name?: string;
  unit_price_idr?: number;
}

export interface IRentalItemLine {
  id: string;
  rental_id?: string;
  order_item_id?: string;
  product_variant_id?: string;
  variant?: IRentalVariant;
  order_item?: IRentalOrderItem;
  quantity_rented?: number;
  quantity_returned?: number;
  quantity_released_by_void?: number;
  created_at?: string;
}

export interface IRentalLocation {
  id?: string;
  code?: string;
  name?: string;
}

export interface IRentalPayment {
  id?: string;
  status?: string;
  order_id?: string;
  provider?: string;
}

export interface IRentalOrder {
  id?: string;
  location_id?: string;
  fulfillment_status?: string;
}

export interface IRentalUser {
  id?: string;
  full_name: string;
  phone?: string;
  email?: string;
}

export interface IRentalItem {
  id: string;
  order_id?: string;
  payment_id?: string;
  location_id?: string;
  user_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  user?: IRentalUser;
  location?: IRentalLocation;
  payment?: IRentalPayment;
  order?: IRentalOrder;
  items?: IRentalItemLine[];
}

export interface IRentalReturnItem {
  id?: string;
  return_event_id?: string;
  rental_item_id?: string;
  variant?: IRentalVariant;
  order_item?: IRentalOrderItem;
  quantity?: number;
  condition?: string;
}

export interface IRentalReturnEvent {
  id: string;
  rental_id?: string;
  returned_at?: string;
  created_at?: string;
  note?: string | null;
  notes?: string | null;
  result?: {
    id?: string;
    status?: string;
    rental_id?: string;
    location_id?: string;
    idempotent_replay?: boolean;
  };
  items?: IRentalReturnItem[];
}

export interface IRentalDetail extends IRentalItem {
  return_events?: IRentalReturnEvent[];
}

export interface IRentalListParams extends ICommonParams {
  status?: string;
  user_id?: string;
}

export interface IRentalReturnItemPayload {
  rental_item_id: string;
  quantity: number;
}

export interface IReturnRentalPayload {
  items: IRentalReturnItemPayload[];
  note?: string;
}

export type TGetRentalList = (params: IRentalListParams) => Promise<IResponseData<IRentalItem[]>>;
export type TGetRentalDetail = (id: string) => Promise<IResponseData<IRentalDetail>>;
export type TReturnRental = (data: {
  id: string;
  payload: IReturnRentalPayload;
  idempotencyKey: string;
}) => Promise<IResponseData<unknown>>;
