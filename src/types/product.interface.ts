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
  category: ICategoryProduct;
}

export interface ICategoryProduct {
  id: string;
  name: string;
}

export type TProductItemList = (params: ICommonParams) => Promise<IResponseData<IProductItemList[]>>;
