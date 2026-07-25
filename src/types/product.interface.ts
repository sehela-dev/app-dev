import { IResponseData } from "@/lib/config";
import { ICommonParams } from "./general.interface";
import { number } from "zod";

export interface IProductItemList {
  id: string;
  name: string;
  category_id: string;
  description: string;
  photos: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category: ICategoryProduct;
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
export type TProductItemList = (params: ICommonParams) => Promise<IResponseData<IProductItemList[]>>;
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
