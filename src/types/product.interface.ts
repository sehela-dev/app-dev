import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";

export interface IProductItemList {
  id: string;
  name: string;
  category_id: string;
  description: string;
  photos: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_rentable: boolean;
  category: ICategoryProduct;
  variant_count: number;
  stock_total: number;
  stock_rented: number;
  stock_available_to_rent: number;
}

export interface IProductVariantItem {
  id: string;
  product_id: string;
  product_name: string;
  is_rentable: boolean;
  variant_name: string;
  sku: string;
  price_idr: number;
  stock: number;
  stock_total: number;
  stock_rented: number;
  stock_available_to_rent: number;
  inventory: IInventory[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface IInventory {
  id: string;
  location: ILocation;
  created_at: string;
  updated_at: string;
  location_id: string;
  stock_total: number;
  stock_rented: number;
  product_variant_id: string;
  stock_available_to_rent: number;
}

export interface ILocation {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
}

export interface ICategoryProduct {
  id: string;
  name: string;
}

export interface ICreateProductPaylaod {
  name: string;
  category_id: string;
  description: string;
  type: "buy" | "rent";
  photos: File[];
  variants: IProductVariantsItem[];
}

export interface IProductVariantsItem {
  name: string;
  sku: string;
  price: string | number;
  stock: string | number;
}

export interface IProductListParams extends ICommonParams {
  view?: "full" | "variants";
  is_rentable?: boolean | string;
}
export type TProductItemList = (params: IProductListParams) => Promise<IResponseData<IProductItemList[] | IProductVariantItem[]>>;
export type TCreateProduct = (paylaod: ICreateProductPaylaod | FormData) => Promise<IResponseData<never>>;
// category

export interface IProductCategory {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TProductCategories = (data: ICommonParams) => Promise<IResponseData<IProductCategory[]>>;

//inventory-location

export interface IParamsInventory {
  category_id?: string;
  product_id?: string;
}

export interface IInventoryLocationResponse {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TInventoryLocations = (data?: IParamsInventory) => Promise<IResponseData<IInventoryLocationResponse[]>>;
