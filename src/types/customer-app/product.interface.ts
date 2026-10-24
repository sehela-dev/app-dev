import { IPublicPagination } from "./public.interface";

export interface IProductAvailability {
  location_id: string;
  location_code: string;
  location_name: string;
  stock_available: number;
}

export interface IPublicProductVariant {
  id: string;
  variant_name: string;
  sku?: string | null;
  price_idr: number;
  stock_total: number;
  stock_available: number;
  availability: IProductAvailability[];
}

export interface IPublicProduct {
  id: string;
  name: string;
  description: string | null;
  photos: string[];
  category: { id: string; name: string } | null;
  is_rentable: boolean;
  stock_available: number;
  variants: IPublicProductVariant[];
}

export interface IPublicProductsParams {
  q?: string;
  page?: number;
  page_size?: number;
  category_id?: string;
  is_rentable?: boolean;
}

export interface IPublicProductsResponse {
  success: boolean;
  data: IPublicProduct[];
  pagination: IPublicPagination;
}

export type TGetPublicProducts = (params?: IPublicProductsParams) => Promise<IPublicProductsResponse>;
export type TGetPublicProduct = (id: string) => Promise<IPublicProduct>;

export interface ICartItem {
  variant_id: string;
  product_id: string;
  product_name: string;
  variant_name: string;
  price_idr: number;
  quantity: number;
  location_id: string;
  location_name: string;
  photo?: string | null;
}
